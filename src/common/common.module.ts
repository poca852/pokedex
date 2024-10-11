import { Module } from "@nestjs/common";
import { ParseMongoIdPipe } from "./pipes/parse-mongoid.pipe";

@Module({
  providers: [ParseMongoIdPipe],
  exports: [ParseMongoIdPipe]
})
export class CommonModule {}