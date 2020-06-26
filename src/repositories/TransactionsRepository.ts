import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);

    const incomeTransactions = await transactionsRepository.find({
      where: { type: 'income' },
    });

    const outcomeTransactions = await transactionsRepository.find({
      where: { type: 'outcome' },
    });

    const incomeBalance = incomeTransactions.reduce(
      (t, { value }) => t + value,
      0,
    );

    const outcomeBalance = outcomeTransactions.reduce(
      (t, { value }) => t + value,
      0,
    );

    return {
      income: incomeBalance,
      outcome: outcomeBalance,
      total: incomeBalance - outcomeBalance,
    };
  }
}

export default TransactionsRepository;
