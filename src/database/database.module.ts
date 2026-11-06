import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppConfigService } from '../config/app-config.service.js';
import { buildPostgresOptions } from './database-options.js';
import { describeDatabaseUrl } from './describe-database-url.js';

export class DatabaseConnectionError extends Error {
  constructor(target: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(
      `Could not connect to the database at ${target}. ` +
        `Check that Postgres is running and that DATABASE_URL (and DATABASE_SSL) are correct. Reason: ${reason}`,
      { cause },
    );
    this.name = 'DatabaseConnectionError';
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        ...buildPostgresOptions({
          url: config.databaseUrl,
          ssl: config.databaseSsl,
        }),
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 1000,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options!);
        try {
          return await dataSource.initialize();
        } catch (error) {
          throw new DatabaseConnectionError(
            describeDatabaseUrl(String((options as { url?: string }).url)),
            error,
          );
        }
      },
    }),
  ],
})
export class DatabaseModule {}
