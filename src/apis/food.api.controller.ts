import { inject } from 'tsyringe';
import {
  GetMapping,
  RestController,
} from '../decoratos/api/rest.api.decorator';
import { FoodService } from '../services/food.service';
import { SessionAuthen } from '../decoratos/api/guards/guard.auth.decorator';

@RestController('/api/food')
export class FoodRestController {
  constructor(
    @inject(FoodService)
    private readonly foodService: FoodService,
  ) {}

  @SessionAuthen()
  @GetMapping('/')
  public async getAll() {
    return this.foodService.getFoods();
  }
}
