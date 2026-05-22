import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  obra?: string;
  obraName?: string;
  locacaoType?: string;
  residuos?: string[];
  equipmentType: "cacamba" | "outros";
  locador?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

const DEFAULT_ITEMS: CartItem[] = [
  {
    id: "1",
    name: "Caçamba Estacionária C4",
    price: 250,
    quantity: 1,
    obra: "1",
    obraName: "Edifício Horizonte",
    locacaoType: "externa",
    residuos: ["alvenaria"],
    equipmentType: "cacamba",
    locador: "EcoEntulho"
  },
  {
    id: "2",
    name: "Mini Escavadeira",
    price: 450,
    quantity: 1,
    obra: "1",
    obraName: "Edifício Horizonte",
    equipmentType: "outros",
    locador: "Disk Caçamba"
  },
  {
    id: "3",
    name: "Caçamba Roll-on 10m³",
    price: 450,
    quantity: 1,
    obra: "2",
    obraName: "Residencial Parque",
    locacaoType: "interna",
    residuos: ["madeira", "gesso"],
    equipmentType: "cacamba",
    locador: "Mega Locações"
  },
  {
    id: "4",
    name: "Gerador 55kVA",
    price: 320,
    quantity: 1,
    obra: "2",
    obraName: "Residencial Parque",
    equipmentType: "outros",
    locador: "LocaTudo"
  }
];

export const useCartStore = create<CartStore>((set, get) => ({
  items: DEFAULT_ITEMS,
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find((i) => 
      i.id === item.id && 
      i.obra === item.obra && 
      JSON.stringify(i.residuos) === JSON.stringify(item.residuos) &&
      i.locacaoType === item.locacaoType
    );

    if (existingItem) {
      set({
        items: items.map((i) =>
          i === existingItem ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  updateQuantity: (id, quantity) =>
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
