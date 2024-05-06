import { inject, injectable } from 'tsyringe';
import { FoodRepository } from '../repositories/food.repository';
import { AppBaseResponseDto } from '../dtos/res/app.api.base.res.dto';
import { StatusEnum } from '../enum/status.enum';

@injectable()
export class FoodService {
  constructor(
    @inject(FoodRepository)
    private readonly foodRepository: FoodRepository,
  ) {}

  public async getFoods() {
    const foods = await this.foodRepository.find();
    return {
      status: StatusEnum.OK,
      message: 'OK',
      data: foods.map((food) => {
        return {
          id: food.id,
          imgurl: food.imgurl,
          price: food.price,
          unit: food.unit,
          description: food.description,
        };
      }),
    } as AppBaseResponseDto;
  }
}
