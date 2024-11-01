import { DestinationType } from '@evefan/evefan-config';
import { getConfig } from './config';
import { DestinationEvent } from './schema/event';
import { fanOutEventData } from './writer';
import { Bindings } from './env';

type QueueEnv = Bindings;

export async function handleQueueEventConsumer(
  batch: MessageBatch<DestinationEvent>,
  env: QueueEnv
) {
  console.debug(
    `Handling batch of ${batch.messages.length} events from queue ${batch.queue}`
  );
  const currentTime = Date.now();
  const maxRetentionPeriod = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds.

  // Extract destination type from queue name (last part of the queue name).
  const destinationType = batch.queue.split('-').pop() as DestinationType;

  try {
    const config = await getConfig();
    const id = env.HEALTH.idFromName(destinationType);
    const health = env.HEALTH.get(id);

    // Up to 18 retries fit in the 4 day period allowed by cloudflare for failed messages.
    const maxRetries = 18;

    const destination = config.destinations.find(
      (d) => d.type === destinationType
    );
    if (!destination || !destination.handler) {
      console.error(`No config found for destination type ${destinationType}`);
      return;
    }

    const failed = await fanOutEventData(
      config,
      batch.messages.map((m) => m.body),
      destination.type
    );

    console.log(
      `${destinationType}: ${
        batch.messages.length - (failed[0]?.failedEvents.length || 0)
      } events successfully completed. ${
        failed[0]?.failedEvents.length || 0
      } failed.`
    );

    const successfulMessages = batch.messages.filter(
      (message) =>
        !failed.some((failedEvent) =>
          failedEvent.failedEvents.some(
            (event) =>
              JSON.stringify(event.body) === JSON.stringify(message.body)
          )
        )
    );

    if (successfulMessages.length > 0) {
      console.debug(
        `${destinationType}: acknowledging ${successfulMessages.length} successful events`
      );

      // Reset health check for successful messages.
      await health.resetEventsState(
        successfulMessages.map((m) => m.body.messageId)
      );
    }

    // Ack successful messages (may need check by event id).
    successfulMessages.forEach((message) => message.ack());

    // Requeue failed messages that haven't reached max retries.
    const messagesToRequeue = batch.messages.filter(
      (message) =>
        (failed.some((failedEvent) =>
          failedEvent.failedEvents.some(
            (event) =>
              JSON.stringify(event.body) === JSON.stringify(message.body)
          )
        ) &&
          message.attempts <= maxRetries) ||
        currentTime - message.timestamp.getTime() >= maxRetentionPeriod
    );

    if (messagesToRequeue.length > 0) {
      console.debug(
        `${destinationType}: requeuing ${messagesToRequeue.length} events`
      );
    }

    messagesToRequeue.forEach((message) => {
      // Exponential backoff with a cap of 12 hours.
      const delaySeconds = Math.min(
        Math.pow(2, message.attempts + 1),
        12 * 60 * 60
      );

      console.debug(
        `${destinationType}: retrying event ${message.id} with attempts ${message.attempts} in ${delaySeconds} seconds`
      );

      message.retry({
        delaySeconds,
      });
    });

    // Save failed messages that have reached max retries or max retention period to S3.
    const remainingEvents = batch.messages.filter(
      (message) =>
        failed.some((failedEvent) =>
          failedEvent.failedEvents.some(
            (event) =>
              JSON.stringify(event.body) === JSON.stringify(message.body)
          )
        ) && !messagesToRequeue.includes(message)
    );

    if (remainingEvents.length > 0) {
      console.warn(
        `${destinationType}: ${remainingEvents.length} failed events will be discarded`
      );

      // Reset health check for discarded messages.
      await health.resetEventsState(
        remainingEvents.map((m) => m.body.messageId)
      );
    }
  } catch (error) {
    console.error(
      'Error when processing queue message for queue ' + batch.queue,
      error
    );
  }
}

export async function checkCloudflareQueuesConfiguration(): Promise<
  Record<DestinationType, string[]>
> {
  const config = await getConfig();

  if (!config.queue.credentials.accountId || !config.queue.credentials.apiKey) {
    throw new Error('Cloudflare queue credentials are not set');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.queue.credentials.accountId}/queues`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.queue.credentials.apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as {
    success: boolean;
    result: Array<{
      queue_name: string;
      consumers: Array<{ script: string }>;
    }>;
  };

  if (!data.success) {
    throw new Error('Failed to fetch Cloudflare queues');
  }

  const configuredQueues = new Map(
    data.result.map((queue) => [queue.queue_name, queue])
  );

  // @ts-expect-error
  const errors: Record<DestinationType, string[]> = {};

  config.destinations.forEach((dest) => {
    const queueName = `${config.deploy.scriptName}-${dest.type}`;
    const deadLetterQueueName = `${config.deploy.scriptName}-dl-${dest.type}`;
    const destErrors: string[] = [];

    if (!configuredQueues.has(queueName)) {
      destErrors.push(`Missing queue: ${queueName}`);
    } else {
      const queue = configuredQueues.get(queueName)!;
      if (queue.consumers.length === 0) {
        destErrors.push(`No consumers for queue: ${queueName}`);
      } else if (queue.consumers[0].script !== config.deploy.scriptName) {
        destErrors.push(
          `Consumer script name mismatch for queue: ${queueName}. Expected: ${config.deploy.scriptName}, Found: ${queue.consumers[0].script}`
        );
      }
    }

    if (!configuredQueues.has(deadLetterQueueName)) {
      destErrors.push(`Missing dead letter queue: ${deadLetterQueueName}`);
    }

    if (destErrors.length > 0) {
      errors[dest.type] = destErrors;
    }
  });

  return errors;
}
