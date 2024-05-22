import { inject } from 'tsyringe';
import { AdminAuth } from '../../decoratos/api/guards/guard.admin.auth.decorator';
import { PipeDto } from '../../decoratos/api/pipe.decorator';
import {
  Body,
  PutMapping,
  RestController,
} from '../../decoratos/api/rest.api.decorator';
import { AdminManageMovieChangeStatusMovieRequestDto } from '../../dtos/req/admin/admin.manage-movie.req.dto';
import { AdminManageMovieService } from '../../services/admin/admin.manage-movie.service';

@RestController('/api/admin/manage-movie')
export class AdminManageMovieRestController {
  constructor(
    @inject(AdminManageMovieService)
    private readonly adminManageMovieService: AdminManageMovieService,
  ) {}

  @AdminAuth()
  @PutMapping('/change-status')
  public async changeStatusMovie(
    @Body(null, PipeDto(AdminManageMovieChangeStatusMovieRequestDto))
    dto: AdminManageMovieChangeStatusMovieRequestDto,
  ) {
    return this.adminManageMovieService.changeStatusMovie(dto);
  }
}
