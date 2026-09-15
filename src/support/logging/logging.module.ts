import { Module } from '@nestjs/common';
import { createSharedWinstonLoggerOptions } from '@sisques-labs/nestjs-kit';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    WinstonModule.forRoot(
      createSharedWinstonLoggerOptions({
        service: 'cookidoo-mcp',
        // Disable file rotation: in a container (Render, Docker) there is no
        // writable CWD and logs are captured from stdout by the platform.
        enableDailyRotateFile: false,
        // Forwards every log line into the OpenTelemetry Logs pipeline
        // (src/telemetry.ts) alongside the existing console/file transports.
        // A no-op when OTEL_EXPORTER_OTLP_ENDPOINT is unset.
        additionalTransports: [new OpenTelemetryTransportV3()],
      }),
    ),
  ],
  exports: [WinstonModule],
})
export class LoggingModule {}
