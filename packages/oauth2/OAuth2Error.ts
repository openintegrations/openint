
export class OAuth2Error<T = unknown> extends Error {
  override name = 'OAuth2Error';

  constructor(
    // prettier-ignore
    public override readonly message: string,
    public readonly data: T,
    public readonly request: {
      status: number;
      statusText: string;
      url: string;
      method: string;
      headers: Record<string, string>;
    }
  ) {
    super(message);
    Object.setPrototypeOf(this, OAuth2Error.prototype);
  }
}
