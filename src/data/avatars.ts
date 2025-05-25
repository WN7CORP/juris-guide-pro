
export interface Avatar {
  id: string;
  name: string;
  gender: 'masculino' | 'feminino' | 'neutro';
  emoji: string;
}

export const avatars: Avatar[] = [
  // Masculinos
  { id: 'man1', name: 'Advogado Executivo', gender: 'masculino', emoji: '👨‍💼' },
  { id: 'man2', name: 'Juiz Sênior', gender: 'masculino', emoji: '👨‍⚖️' },
  { id: 'man3', name: 'Professor', gender: 'masculino', emoji: '👨‍🏫' },
  { id: 'man4', name: 'Estudante', gender: 'masculino', emoji: '👨‍🎓' },
  { id: 'man5', name: 'Pesquisador', gender: 'masculino', emoji: '👨‍💻' },
  { id: 'man6', name: 'Defensor', gender: 'masculino', emoji: '🧔‍♂️' },
  { id: 'man7', name: 'Especialista', gender: 'masculino', emoji: '👨‍🔬' },
  { id: 'man8', name: 'Consultor', gender: 'masculino', emoji: '🕴️' },
  { id: 'man9', name: 'Analista', gender: 'masculino', emoji: '👱‍♂️' },
  { id: 'man10', name: 'Coordenador', gender: 'masculino', emoji: '👨‍💼' },

  // Femininos
  { id: 'woman1', name: 'Advogada Executiva', gender: 'feminino', emoji: '👩‍💼' },
  { id: 'woman2', name: 'Juíza Sênior', gender: 'feminino', emoji: '👩‍⚖️' },
  { id: 'woman3', name: 'Professora', gender: 'feminino', emoji: '👩‍🏫' },
  { id: 'woman4', name: 'Estudante', gender: 'feminino', emoji: '👩‍🎓' },
  { id: 'woman5', name: 'Pesquisadora', gender: 'feminino', emoji: '👩‍💻' },
  { id: 'woman6', name: 'Defensora', gender: 'feminino', emoji: '👩‍🦰' },
  { id: 'woman7', name: 'Especialista', gender: 'feminino', emoji: '👩‍🔬' },
  { id: 'woman8', name: 'Consultora', gender: 'feminino', emoji: '💃' },
  { id: 'woman9', name: 'Analista', gender: 'feminino', emoji: '👱‍♀️' },
  { id: 'woman10', name: 'Coordenadora', gender: 'feminino', emoji: '👩‍💼' },

  // Neutros
  { id: 'neutral1', name: 'Profissional', gender: 'neutro', emoji: '🧑‍💼' },
  { id: 'neutral2', name: 'Magistrado', gender: 'neutro', emoji: '🧑‍⚖️' },
  { id: 'neutral3', name: 'Educador', gender: 'neutro', emoji: '🧑‍🏫' },
  { id: 'neutral4', name: 'Acadêmico', gender: 'neutro', emoji: '🧑‍🎓' },
  { id: 'neutral5', name: 'Tecnólogo', gender: 'neutro', emoji: '🧑‍💻' },
  { id: 'neutral6', name: 'Representante', gender: 'neutro', emoji: '🧑‍🤝‍🧑' },
  { id: 'neutral7', name: 'Cientista', gender: 'neutro', emoji: '🧑‍🔬' },
  { id: 'neutral8', name: 'Especialista', gender: 'neutro', emoji: '🤵' },
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return avatars.find(avatar => avatar.id === id);
};

export const getAvatarsByGender = (gender: 'masculino' | 'feminino' | 'neutro'): Avatar[] => {
  return avatars.filter(avatar => avatar.gender === gender);
};
