import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * 全局设置配置
 */
interface SettingsConfig {
  PAUSE_BETWEEN_SWAPS:[number, number],
  THREADS:number,
  ATTEMPTS:number,
  PAUSE_BETWEEN_ATTEMPTS:[number, number],
  RANDOM_INITIALIZATION_PAUSE:[number, number],
  RANDOM_PAUSE_BETWEEN_ACCOUNTS:[number, number],
  RANDOM_PAUSE_BETWEEN_ACTIONS:[number, number],
  ACCOUNTS_RANGE:[number, number],
  EXACT_ACCOUNTS_TO_USE:[]

}

interface DisperseConfig  {
  MIN_BALANCE_FOR_DISPERSE: [number, number], // 元组表示范围
  THREADS:number

}

/**
 * 启动任务配置
 */
interface FlowConfig  {
  TASKS: string[], // 元组表示范围

}

interface DustedConfig  {
  SKIP_TWITTER_VERIFICATION: string[], // 元组表示范围

}

export interface Config {
  SETTINGS:SettingsConfig,
  DISPERSE:DisperseConfig,
  FLOW:FlowConfig,
  DUSTED:DustedConfig
}

function loadConfig(): Config {
  const configPath = '../config.yaml';
  const rawData = fs.readFileSync(configPath, 'utf-8');
  return yaml.load(rawData) as Config;
}

export const config = loadConfig();
