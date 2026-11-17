import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  const usersRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it("finds a user by phone", async () => {
    usersRepository.findOne.mockResolvedValue({ id: "user-1", phone: "+8801712345678" });
    await expect(service.findByPhone("+8801712345678")).resolves.toMatchObject({ id: "user-1" });
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { phone: "+8801712345678" } });
  });

  it("selects the password hash for authentication", async () => {
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: "user-1" }),
    };
    usersRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    await expect(service.findByPhoneWithPassword("+8801712345678")).resolves.toMatchObject({ id: "user-1" });
    expect(queryBuilder.addSelect).toHaveBeenCalledWith("user.passwordHash");
    expect(queryBuilder.where).toHaveBeenCalledWith("user.phone = :phone", { phone: "+8801712345678" });
  });
});
