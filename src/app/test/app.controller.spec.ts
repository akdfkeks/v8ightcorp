import { INestApplication } from '@nestjs/common';
import { AppController } from 'src/app/app.controller';
import { AppService } from 'src/app/app.service';
import { Test } from '@nestjs/testing';

describe('AppController', () => {
  let app: INestApplication;
  let appService: AppService;
  let appController: AppController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    appService = app.get<AppService>(AppService);
    appController = app.get<AppController>(AppController);

    app.init();
  });

  it('should return "Hello World!"', () => {
    jest.spyOn(appService, 'getHello').mockImplementation(() => 'Hello World!');
    expect(appController.getHello()).toEqual('Hello World!');
  });
});
