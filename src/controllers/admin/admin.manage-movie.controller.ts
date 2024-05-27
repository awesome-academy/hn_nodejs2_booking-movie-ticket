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
      csrfToken: req.csrfToken(),
    });
  }

  public async getAdminManageTicketView(
    req: Request,
    resp: Response,
    next: NextFunction,
  ) {
    resp.render('admin/admin-manage-ticket', {
      active: 'manage-ticket',
      csrfToken: req.csrfToken(),
    });
  }
}
