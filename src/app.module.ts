import { AppService } from './app.service'
import { ScheduleModule } from '@nestjs/schedule'
import { HttpModule, Module } from '@nestjs/common'

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  providers: [AppService]
})
export class AppModule {}
