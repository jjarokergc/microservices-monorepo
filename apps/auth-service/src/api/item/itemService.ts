/**
 * Service layer for Item entities.
 *
 * Provides business logic for item operations, coordinates with ItemRepository,
 * and returns consistent ServiceResponse objects (success/failure with status & message).
 *
 * Exported singleton: `itemService`
 *
 * Current methods:
 * - findAll()     → List all items
 * - findBySku()   → Get item by SKU
 *
 * Pattern: Service → Repository (data access)
 * Errors are logged but never thrown — always return structured response.
 */
import { StatusCodes } from 'http-status-codes';

import type { ItemCreatePayload, ItemUpdatePayload } from './itemModel';
import { ItemRepository } from './itemRepository';
import { ServiceResponse } from '@example-org/common';
import { appLogger } from '@example-org/common';

export class ItemService {
  private itemRepository: ItemRepository;

  constructor(repository: ItemRepository = new ItemRepository()) {
    this.itemRepository = repository;
  }

  // Retrieves all items from the database
  async findAll(): Promise<ServiceResponse<ItemCreatePayload[] | null>> {
    try {
      const items = await this.itemRepository.findAllAsync();
      if (!items) {
        return ServiceResponse.failure('No Data Found', null, StatusCodes.NOT_FOUND);
      }
      if (items.length === 0) {
        return ServiceResponse.failure('Table is Empty', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ItemCreatePayload[]>('Items found', items);
    } catch (ex) {
      const errorMessage = `Error finding all items: $${(ex as Error).message}`;
      appLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving items.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Retrieves a single item by their ID
  async findByIdAsync(itemId: string): Promise<ServiceResponse<ItemCreatePayload | null>> {
    try {
      const item = await this.itemRepository.findByIdAsync(itemId);
      if (!item) {
        return ServiceResponse.failure('Item not found', null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<ItemCreatePayload>('Item found', item);
    } catch (ex) {
      const errorMessage = `Error finding item with id ${itemId}:, ${(ex as Error).message}`;
      appLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding item.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Creates a new item in the database
  async createItem(data: ItemCreatePayload): Promise<ServiceResponse<ItemCreatePayload | null>> {
    appLogger.debug(`Creating item with data: ${JSON.stringify(data)}`);
    try {
      const newItem = await this.itemRepository.createAsync(data);
      return ServiceResponse.success<ItemCreatePayload>(
        'Item created successfully',
        newItem,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating item: ${(ex as Error).message}`;
      appLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the item.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async updateItemByIdAsync(
    itemId: string,
    data: ItemUpdatePayload
  ): Promise<ServiceResponse<ItemCreatePayload | null>> {
    appLogger.debug(`Updating item ${itemId} with data: ${JSON.stringify(data)}`);
    try {
      const updatedItem = await this.itemRepository.updateAsync(itemId, data);

      if (!updatedItem) {
        return ServiceResponse.failure('Item not found for update', null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<ItemCreatePayload>(
        'Item updated successfully',
        updatedItem,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error updating item: ${(ex as Error).message}`;
      appLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the item.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteItemByIdAsync(itemId: string): Promise<ServiceResponse<ItemCreatePayload | null>> {
    appLogger.debug(`Deleting item with ID: ${itemId}`);
    try {
      const deletedItem = await this.itemRepository.deleteByIdAsync(itemId);

      if (!deletedItem) {
        return ServiceResponse.failure('Item not found for deletion', null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<ItemCreatePayload>(
        'Item deleted successfully',
        deletedItem,
        StatusCodes.NO_CONTENT
      );
    } catch (ex) {
      const errorMessage = `Error deleting item: ${(ex as Error).message}`;
      appLogger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while deleting the item.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
// Singleton instance
export const itemService = new ItemService();
