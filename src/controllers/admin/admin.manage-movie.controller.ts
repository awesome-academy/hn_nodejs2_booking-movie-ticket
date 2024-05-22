import { Request, Response, NextFunction } from 'express-serve-static-core';
import { inject, injectable } from 'tsyringe';
import { CategoryService } from '../../services/category.service';

@injectable()
export class AdminManageMovieController {
  constructor(
    @inject(CategoryService)
    private readonly categoryService: CategoryService,
  ) {}

  public async getAdminManageMoiveView(
    req: Request,
    resp: Response,
    next: NextFunction,
  ) {
    const categories = await this.categoryService.getAllCategories();
    resp.render('admin/admin-manage-movie', {
      active: 'manage-movie',
      categories,
    });
  }
}
