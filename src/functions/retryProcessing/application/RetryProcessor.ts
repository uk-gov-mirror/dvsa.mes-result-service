import * as mysql from 'mysql2';
import {
  buildMarkTestProcessedQuery,
  buildUpdateErrorsToRetryQuery,
  buildAbortTestsExceeingRetryQuery,
  buildManualInterventionUpdateQuery,
  buildDeleteAcceptedQueueRowsQuery,
} from '../framework/database/query-builder';
import { IRetryProcessor } from './IRetryProcessor';
import { warn, customMetric } from '@dvsa/mes-microservice-common/application/utils/logger';

export class RetryProcessor implements IRetryProcessor {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async processSuccessful(): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildMarkTestProcessedQuery());
      customMetric(
        'ResultsSuccessfullyProcessedRowsChanged',
        'The amount of TEST_RESULT records updated to SUCCESSFUL status',
        rows.changedRows,
      );
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking test results as successfully submitted', err.messsage);
    }
  }
  async processErrorsToRetry(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().
        query(buildUpdateErrorsToRetryQuery(
          rsisRetryCount,
          notifyRetryCount,
          tarsRetryCount,
        ));
      customMetric(
        'InterfacesQueuedForRetryRowsChanged',
        'The amount of UPLOAD_QUEUE records updated back to PROCESSING status for retry',
        rows.changedRows,
      );
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as ready for retry', err.message);
    }
  }
  async processErrorsToAbort(
    rsisRetryCount: number,
    notifyRetryCount: number,
    tarsRetryCount: number,
  ): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildAbortTestsExceeingRetryQuery(
        rsisRetryCount,
        notifyRetryCount,
        tarsRetryCount,
      ));
      customMetric(
        'ResultsAbortedRowsChanged',
        'The amount of TEST_RESULT records moved to the ERROR status',
        rows.changedRows,
      );
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught marking interfaces as aborted', err.message);
    }
  }

  async processSupportInterventions(): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildManualInterventionUpdateQuery());
      customMetric(
        'InterventionRequeueRowsChanged',
        'The number of TEST_RESULT+UPLOAD_QUEUE records updated as part of reprocessing manual intervention',
        rows.changedRows,
      );
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught updating records marked for reprocess by manual intervention', err.message);
    }
  }

  async processOldEntryCleanup(cutOffPointInDays: number): Promise<void> {
    try {
      await this.connection.promise().beginTransaction();
      const [rows] = await this.connection.promise().query(buildDeleteAcceptedQueueRowsQuery(cutOffPointInDays));
      customMetric(
        'UploadQueueCleanupRowsChanged',
        'The number of UPLOAD_QUEUE records deleted due to being successful and older than the threshold',
        rows.changedRows,
      );
      await this.connection.promise().commit();
    } catch (err) {
      this.connection.rollback();
      warn('Error caught processing old upload queue record cleanup', err.message);
    }
  }

}
