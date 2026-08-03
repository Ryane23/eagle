import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiDocumentationRedirect() {
    return {
      url: '/api/docs',
      statusCode: 302,
    };
  }
}
