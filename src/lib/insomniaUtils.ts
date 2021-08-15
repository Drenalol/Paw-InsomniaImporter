import Insomnia from "../types-paw-api/insomnia";

const convertAuthenticationToRecords = (authentication: Insomnia.Authentication): Record<string, string> => {
  return Object.entries(authentication).reduce((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {} as Record<string, string>);
}

const getInsomniaAuthParam = (records: Record<string, string>, key: string): string | null => {
  return records[key] as string | null;
}

export {getInsomniaAuthParam, convertAuthenticationToRecords}