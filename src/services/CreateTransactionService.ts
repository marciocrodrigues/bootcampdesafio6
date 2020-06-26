import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  titleCategory: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    titleCategory,
  }: Request): Promise<Transaction> {
    const balanceRepository = new TransactionsRepository();
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepotiory = getRepository(Category);

    const transactions = await transactionsRepository.find();

    if (transactions.length === 0 && type === 'outcome') {
      throw new AppError('Income value is less than the outcome', 400);
    }

    if (transactions.length > 0 && type === 'outcome') {
      const balance = await balanceRepository.getBalance();
      if (value > balance.total) {
        throw new AppError('Income value is less than the outcome', 400);
      }
    }

    let category_id;

    const checkCategoryExists = await categoriesRepotiory.findOne({
      where: { title: titleCategory },
    });

    if (!checkCategoryExists) {
      const category = categoriesRepotiory.create({
        title: titleCategory,
      });
      await categoriesRepotiory.save(category);
      category_id = category.id;
    } else {
      category_id = checkCategoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
