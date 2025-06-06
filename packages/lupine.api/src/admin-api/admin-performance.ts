import cluster from 'cluster';
import os, { userInfo } from 'os';
import { ServerResponse } from 'http';
import {
  // Logger,
  ServerRequest,
  ApiHelper,
  JsonObject,
  formatBytes,
  DateUtils,
  getRequestCount,
  getApiVersion,
  ApiRouter,
  IApiBase,
  Logger,
  AppCacheKeys,
  AppCacheGlobal,
  getAppCache,
} from 'lupine.api';
import { adminHelper } from './admin-helper';
import { needDevAdminSession } from './admin-auth';

// #https://github.com/sebhildebrandt/systeminformation
export class AdminPerformance implements IApiBase {
  private logger = new Logger('performance-api');
  protected router = new ApiRouter();

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    // called by FE
    this.router.use('/data', needDevAdminSession, this.performanceData.bind(this));
  }

  async performanceData(req: ServerRequest, res: ServerResponse) {
    const json = adminHelper.getDevAdminFromCookie(req, res, true);
    if (!json) {
      return false;
    }
    const response: JsonObject = {
      status: 'ok',
      results: {
        appInfo: {
          debug: getAppCache().get(AppCacheGlobal, AppCacheKeys.APP_DEBUG),
          apiVersion: getApiVersion(),
          appStartTime: getAppCache().get(AppCacheGlobal, AppCacheKeys.START_TIME),
          runningTime: DateUtils.diffString(new Date(), getAppCache().get(AppCacheGlobal, AppCacheKeys.START_TIME)),
          // request info
          // process info
          inProcessingRequests: getRequestCount(),
          isPrimary: cluster.isPrimary,
          workerId: cluster.worker ? cluster.worker.id : 0,
        },
        totalmem: formatBytes(os.totalmem()),
        freemem: formatBytes(os.freemem()),
        memory: {
          arrayBuffers: formatBytes(process.memoryUsage().arrayBuffers),
          external: formatBytes(process.memoryUsage().external),
          heapTotal: formatBytes(process.memoryUsage().heapTotal),
          heapUsed: formatBytes(process.memoryUsage().heapUsed),
          rss: formatBytes(process.memoryUsage().rss),
        },
        // diskLayout: os.versions(),
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname(),
        type: os.type(),
        homedir: os.homedir(),
        tmpdir: os.tmpdir(),
        userInfo: {
          username: userInfo().username,
          uid: userInfo().uid,
          gid: userInfo().gid,
          shell: userInfo().shell,
          homedir: userInfo().homedir,
        },
        machine: os.machine(),
        // networkInterfaces: os.networkInterfaces(),
        endianness: os.endianness(),
        arch: os.arch(),
        // cpuSystemUsage: process.cpuUsage().system,
        // cpuUserUsage: process.cpuUsage().user,
        availableMemory: process.availableMemory(),
        constrainedMemory: process.constrainedMemory(),
        resourceUsage: {
          userCPUTime: process.resourceUsage().userCPUTime,
          systemCPUTime: process.resourceUsage().systemCPUTime,
          maxRSS: process.resourceUsage().maxRSS,
          sharedMemorySize: process.resourceUsage().sharedMemorySize,
          unsharedDataSize: process.resourceUsage().unsharedDataSize,
          unsharedStackSize: process.resourceUsage().unsharedStackSize,
          minorPageFault: process.resourceUsage().minorPageFault,
          majorPageFault: process.resourceUsage().majorPageFault,
          swappedOut: process.resourceUsage().swappedOut,
          fsRead: process.resourceUsage().fsRead,
          fsWrite: process.resourceUsage().fsWrite,
          ipcSent: process.resourceUsage().ipcSent,
          ipcReceived: process.resourceUsage().ipcReceived,
          signalsCount: process.resourceUsage().signalsCount,
          voluntaryContextSwitches: process.resourceUsage().voluntaryContextSwitches,
          involuntaryContextSwitches: process.resourceUsage().involuntaryContextSwitches,
        },
        cpu: os.loadavg(),
        cpuCount: os.cpus().length,
        cpus: os.cpus().map((c) => ({
          model: c.model,
          speed: c.speed,
          times: c.times,
        })),
        process: {
          ...(process as any),
          mainModule: undefined,
          moduleLoadList: undefined,
          config: undefined,
        },
      },
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
}
