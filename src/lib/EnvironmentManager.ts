import Paw from '../types-paw-api/paw';

class EnvironmentManager {
  name: string;
  context: Paw.Context;
  environmentDomain: Paw.EnvironmentDomain | null;

  constructor(context: Paw.Context, name: string) {
    this.name = name;
    this.context = context;
    this.environmentDomain = null;
  }

  private getEnvironmentDomain(): Paw.EnvironmentDomain {
    if (!this.environmentDomain) {
      this.environmentDomain = this.context.getEnvironmentDomainByName(this.name);

      if (!this.environmentDomain) {
        this.environmentDomain = this.context.createEnvironmentDomain(this.name);
      }
    }

    return this.environmentDomain
  }

  public getOrCreateEnvironment(name: string): Paw.Environment {
    let environment = this.getEnvironmentDomain().getEnvironmentByName(name);

    if (!environment) {
      environment = this.getEnvironmentDomain().createEnvironment(name);
    }

    return environment;
  }

  public getOrCreateEnvironmentVariable(name: string): Paw.EnvironmentVariable {
    let variable = this.getEnvironmentDomain().getVariableByName(name);

    if (!variable) {
      variable = this.getEnvironmentDomain().createEnvironmentVariable(name);
    }

    return variable;
  }

  public getEnvironmentVariable(name: string): Paw.EnvironmentVariable | null {
    return this.getEnvironmentDomain().getVariableByName(name);
  }

}

export default EnvironmentManager
