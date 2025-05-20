
import { LegalCodeTable } from "@/services/legalCodeService";

// Define a mapping from URL parameters to actual table names
export const tableNameMap: Record<string, LegalCodeTable> = {
  "codigo-civil": "Código_Civil",
  "codigo-penal": "Código_Penal",
  "codigo-processo-civil": "Código_de_Processo_Civil",
  "codigo-processo-penal": "Código_de_Processo_Penal", 
  "codigo-tributario": "Código_Tributário_Nacional",
  "codigo-defesa-consumidor": "Código_de_Defesa_do_Consumidor",
  "codigo-transito": "Código_de_Trânsito_Brasileiro",
  "codigo-eleitoral": "Código_Eleitoral",
  "constituicao-federal": "Constituicao_Federal"
};

// Reverse mapping (for display purposes)
export const getCodeIdFromTableName = (tableName: LegalCodeTable): string => {
  const entry = Object.entries(tableNameMap).find(([_, value]) => value === tableName);
  return entry ? entry[0] : "";
};

// Get a formatted display name from table name
export const getDisplayNameFromTableName = (tableName: LegalCodeTable): string => {
  switch (tableName) {
    case "Código_Civil":
      return "Código Civil";
    case "Código_Penal":
      return "Código Penal";
    case "Código_de_Processo_Civil":
      return "Código de Processo Civil";
    case "Código_de_Processo_Penal":
      return "Código de Processo Penal";
    case "Código_Tributário_Nacional":
      return "Código Tributário Nacional";
    case "Código_de_Defesa_do_Consumidor":
      return "Código de Defesa do Consumidor";
    case "Código_de_Trânsito_Brasileiro":
      return "Código de Trânsito Brasileiro";
    case "Código_Eleitoral":
      return "Código Eleitoral";
    case "Constituicao_Federal":
      return "Constituição Federal";
    default:
      return tableName.replace(/_/g, " ");
  }
};
