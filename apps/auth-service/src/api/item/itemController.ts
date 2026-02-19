import type { Request, RequestHandler, Response } from 'express';
import { appLogger } from '@example-org/common';
import { itemService } from './itemService';

class ItemController {
  public getItems: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await itemService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getItem: RequestHandler = async (req: Request, res: Response) => {
    appLogger.debug(`GETITEM - Request params: ${JSON.stringify(req.params)}`);
    const itemId = req.params.itemId as string;
    const serviceResponse = await itemService.findByIdAsync(itemId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public createItem: RequestHandler = async (req: Request, res: Response) => {
    appLogger.debug(`CREATEITEM - Request body: ${JSON.stringify(req.body)}`);
    const itemData = req.body;
    const serviceResponse = await itemService.createItem(itemData);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public updateItem: RequestHandler = async (req: Request, res: Response) => {
    appLogger.debug(`UPDATEITEM - Request params: ${JSON.stringify(req.params)}`);
    appLogger.debug(`UPDATEITEM - Request body: ${JSON.stringify(req.body)}`);
    const itemId = req.params.itemId as string;
    const itemData = req.body;
    const serviceResponse = await itemService.updateItemByIdAsync(itemId, itemData);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public deleteItem: RequestHandler = async (req: Request, res: Response) => {
    appLogger.debug(`DELETEITEM - Request parameter: ${JSON.stringify(req.params)}`);
    const itemId = req.params.itemId as string;
    const serviceResponse = await itemService.deleteItemByIdAsync(itemId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const itemController = new ItemController();
