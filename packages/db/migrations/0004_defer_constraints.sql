ALTER TABLE connector_config
  DROP CONSTRAINT fk_default_pipe_out_destination_id; --> statement-breakpoint

ALTER TABLE connector_config
  DROP CONSTRAINT fk_default_pipe_in_source_id; --> statement-breakpoint

ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_pipe_out_destination_id" FOREIGN KEY ("default_pipe_out_destination_id")
  REFERENCES "public"."connection"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
  DEFERRABLE INITIALLY DEFERRED; --> statement-breakpoint

ALTER TABLE connector_config
  ADD CONSTRAINT "fk_default_pipe_in_source_id" FOREIGN KEY ("default_pipe_in_source_id")
  REFERENCES "public"."connection"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
  DEFERRABLE INITIALLY DEFERRED; --> statement-breakpoint
