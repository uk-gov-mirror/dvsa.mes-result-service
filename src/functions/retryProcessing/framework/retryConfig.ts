import { defaultIfNotPresent } from '@dvsa/mes-microservice-common/framework/config/config';

export type Config = {
  retryCutOffPointDays: number;
  rsisRetryCount: number;
  notifyRetryCount: number;
  tarsRetryCount: number;
  miRetryCount: number;
  dspRetryCount: number;
  autosaveCutOffPointDays: number;
};

let configuration: Config;
export const getRetryConfig = async (): Promise<void> => {
  configuration = {
    retryCutOffPointDays: +defaultIfNotPresent(process.env.CUT_OFF_POINT_DAYS, '30'),
    rsisRetryCount: +defaultIfNotPresent(process.env.RSIS_RETRY_COUNT, '12'),
    notifyRetryCount: +defaultIfNotPresent(process.env.NOTIFY_RETRY_COUNT, '12'),
    tarsRetryCount: +defaultIfNotPresent(process.env.TARS_RETRY_COUNT, '36'),
    miRetryCount: +defaultIfNotPresent(process.env.MI_RETRY_COUNT, '12'),
    dspRetryCount: +defaultIfNotPresent(process.env.DSP_RETRY_COUNT, '36'),
    autosaveCutOffPointDays: +defaultIfNotPresent(process.env.AUTOSAVE_CUT_OFF_POINT_DAYS, '15'),
  };
};

export const retryConfig = (): Config => configuration;
