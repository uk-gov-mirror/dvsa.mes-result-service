export enum InterfaceTypes {
    TARS = 'TARS',
    RSIS = 'RSIS',
    NOTIFY = 'NOTIFY',
  }

export function convertInterfaceIdToInterfaceType(interfaceId: number) {
  switch (interfaceId) {
    case 0: return InterfaceTypes.TARS;
    case 1: return InterfaceTypes.RSIS;
    case 2: return InterfaceTypes.NOTIFY;
  }
}
