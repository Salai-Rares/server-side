import { Container } from "inversify";
import { applySharedBindings } from "./container.base";
import { usersModule } from "@/modules/users/infrastructure/di/users.module";


export function buildWorkerContainer(): Container {
  const container = new Container();

  applySharedBindings(container);
  
 


  return container;
}
