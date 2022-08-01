import { CreateUserDto } from "./create.user.dto";

export interface PatchUserDto extends Partial<CreateUserDto> {}
