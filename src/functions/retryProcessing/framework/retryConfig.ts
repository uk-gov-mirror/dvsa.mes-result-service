import {
    defaultIfNotPresent,
  } from '../../../common/framework/config/config-helpers';

export type Config = {
  retryCutOffPointDays: number;
  rsisRetryCount: number;
  notifyRetryCount: number;
  tarsRetryCount: number;
  autosaveCutOffPointDays: number;
};

let configuration: Config;
export const getRetryConfig = async (): Promise<void> => {
  configuration = {
    retryCutOffPointDays: +defaultIfNotPresent(process.env.CUT_OFF_POINT_DAYS, '30'),
    rsisRetryCount: +defaultIfNotPresent(process.env.RSIS_RETRY_COUNT, '3'),
    notifyRetryCount: +defaultIfNotPresent(process.env.NOTIFY_RETRY_COUNT, '3'),
    tarsRetryCount: +defaultIfNotPresent(process.env.TARS_RETRY_COUNT, '3'),
    autosaveCutOffPointDays: +defaultIfNotPresent(process.env.AUTOSAVE_CUT_OFF_POINT_DAYS, '15'),
  };
};

export const retryConfig = (): Config => configuration;
