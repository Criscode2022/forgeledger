import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

function resolveIndexHtml(): string | null {
  const candidates = [
    join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser', 'index.html'),
    join(__dirname, '..', '..', 'web', 'dist', 'browser', 'index.html'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser', 'index.html'),
    join(process.cwd(), 'apps', 'web', 'dist', 'browser', 'index.html'),
    join(process.cwd(), '..', 'web', 'dist', 'web', 'browser', 'index.html'),
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  private readonly indexHtml = resolveIndexHtml();

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<{
      status: (n: number) => { json: (b: unknown) => void; sendFile: (p: string) => void };
      sendFile: (p: string) => void;
      headersSent: boolean;
    }>();
    const req = ctx.getRequest<{ method: string; path: string; url: string }>();

    const path = req.path || req.url?.split('?')[0] || '';
    const isApi = path.startsWith('/api');
    const isGet = req.method === 'GET' || req.method === 'HEAD';

    if (!isApi && isGet && this.indexHtml) {
      return res.sendFile(this.indexHtml);
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.NOT_FOUND;
    const body = exception.getResponse();
    return res.status(status).json(
      typeof body === 'string' ? { statusCode: status, message: body } : body,
    );
  }
}
