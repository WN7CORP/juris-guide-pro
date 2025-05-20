
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
