import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { User, Wallet, WalletTransaction } from '../models';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export interface AuthResponseData {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
  wallet?: {
    balance: number;
    careerCoins: number;
    isEligibleForRewardedAd: boolean;
  };
}

export class AuthService {
  public static async register(input: RegisterInput): Promise<AuthResponseData> {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists', statusCode: 409 };
      } else {
        throw { code: 'DUPLICATE_USERNAME', message: 'This username is already taken', statusCode: 409 };
      }
    }

    const passwordHash = await hashPassword(input.password);

    // Atomic Database Transaction for Registration + Wallet + Welcome Bonus
    const result = await sequelize.transaction(async (t) => {
      // 1. Create User
      const user = await User.create(
        {
          username: input.username,
          email: input.email,
          passwordHash,
        },
        { transaction: t }
      );

      // 2. Create User Wallet initialized with 500 Coins
      const wallet = await Wallet.create(
        {
          userId: user.id,
          balance: 500,
          careerCoins: 500,
        },
        { transaction: t }
      );

      // 3. Create Idempotent WELCOME_BONUS WalletTransaction
      await WalletTransaction.create(
        {
          walletId: wallet.id,
          amount: 500,
          type: 'WELCOME_BONUS',
          referenceId: `welcome-bonus-${user.id}`,
          description: 'Welcome Bonus (+500 Coins)',
        },
        { transaction: t }
      );

      return { user, wallet };
    });

    const token = generateToken({ userId: result.user.id, email: result.user.email });

    return {
      token,
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
      },
      wallet: {
        balance: result.wallet.balance,
        careerCoins: result.wallet.careerCoins,
        isEligibleForRewardedAd: result.wallet.isEligibleForRewardedAd,
      },
    };
  }

  public static async login(input: LoginInput): Promise<AuthResponseData> {
    const user = await User.findOne({ where: { email: input.email } });

    if (!user) {
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);

    if (!isMatch) {
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password', statusCode: 401 };
    }

    const wallet = await Wallet.findOne({ where: { userId: user.id } });

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      wallet: wallet
        ? {
            balance: wallet.balance,
            careerCoins: wallet.careerCoins,
            isEligibleForRewardedAd: wallet.isEligibleForRewardedAd,
          }
        : undefined,
    };
  }
}
