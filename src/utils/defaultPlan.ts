import { PlanoSemanalResponse } from '../types/patient'

export function createDefaultWeeklyPlan(): PlanoSemanalResponse {
  const dias = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ]

  return {
    plano_semanal: dias.map((dia) => ({
      dia,
      refeicoes: {
        cafe_da_manha: [
          'Ovos mexidos com azeite de oliva e orégano',
          'Pão integral tostado ou tapioca fina',
          'Fruta fresca (mamão papaia ou banana com aveia)',
          'Café preto sem açúcar ou com estévia',
          'Chá verde ou infusão natural',
        ],
        lanche_manha: [
          'Mix de castanhas do Pará e nozes (30g)',
          'Iogurte natural desnatado ou kefir',
          'Fruta da estação (maçã ou pera)',
          'Sementes de abóbora ou girassol tostadas',
          'Água de coco fresca',
        ],
        almoco: [
          'Peito de frango grelhado ou filé de peixe (150g)',
          'Arroz integral ou batata doce cozida',
          'Feijão carioca ou lentilha temperada',
          'Salada crua farta de folhas verdes, tomate e pepino',
          'Legumes no vapor (brócolis, cenoura e abobrinha) com azeite',
        ],
        lanche_tarde: [
          'Vitamina de frutas com leite vegetal e aveia',
          'Panqueca de banana com canela e ovos',
          'Torrada integral com queijo branco ou cottage',
          'Fruta com pasta de amendoim integral',
          'Chá de hortelã ou camomila',
        ],
        jantar: [
          'Omelete de claras com espinafre e tomate',
          'Sopa nutritiva de legumes com frango desfiado',
          'Salada completa com atum sólido ou ovos cozidos',
          'Purê de abóbora cabotiá com carne moída magra',
          'Chá calmante (camomila ou melissa) antes de dormir',
        ],
      },
    })),
  }
}

