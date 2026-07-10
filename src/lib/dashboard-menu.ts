import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  FileBarChart,
  Truck,
  Package,
  DollarSign,
  Building2,
  MapPin,
  Map as MapIcon,
  Settings2,
  ShieldAlert,
} from "lucide-react";

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  children?: { label: string; href: string; roles?: string[] }[];
  roles?: string[];
}

export const menuItems: MenuItem[] = [
  { label: "Painel", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Operacional",
    icon: ClipboardList,
    children: [
      { label: "Painel Operacional", href: "/dashboard/operacional", roles: ["admin", "locador", "destino", "locatario", "prefeitura"] },
      { label: "Gestão de Pedidos", href: "/dashboard/pedidos", roles: ["admin", "locador", "locatario"] },
      { label: "Ordens de Locação", href: "/dashboard/pedidos/ordens", roles: ["admin", "locador", "destino", "locatario", "prefeitura"] },
      { label: "Ocorrências", href: "/dashboard/pedidos/ocorrencias", roles: ["admin", "locador", "prefeitura", "locatario"] },
      { label: "Entrada de Resíduos", href: "/dashboard/operacional/entradas", roles: ["destino"] },
      { label: "Solicitar locação", href: "/dashboard/pedidos/solicitar", roles: ["locatario"] },
    ],
    roles: ["admin", "locador", "destino", "locatario", "prefeitura"],
  },
  {
    label: "Entidades",
    icon: Building2,
    children: [
      { label: "Locadores", href: "/dashboard/locadores", roles: ["admin", "prefeitura"] },
      { label: "Locatários", href: "/dashboard/locatarios", roles: ["admin"] },
      { label: "Prefeituras", href: "/dashboard/prefeituras", roles: ["admin"] },
      { label: "Destino final", href: "/dashboard/destinadores", roles: ["admin", "prefeitura"] },
      { label: "Clientes", href: "/dashboard/clientes", roles: ["destino"] },
      { label: "Transportadores", href: "/dashboard/transportadores", roles: ["destino"] },
      { label: "Geradores", href: "/dashboard/geradores", roles: ["destino"] },
    ],
    roles: ["admin", "prefeitura", "destino"],
  },
  {
    label: "Ativos",
    icon: Package,
    children: [
      { label: "Painel Ativos", href: "/dashboard/ativos", roles: ["admin", "locador", "prefeitura"] },
      { label: "Caçambas", href: "/dashboard/cacambas" },
      { label: "Equipamentos", href: "/dashboard/equipamentos", roles: ["admin", "locador"] },
      { label: "Ocorrências", href: "/dashboard/ativos/ocorrencias", roles: ["locador"] },
      { label: "Manutenções", href: "/dashboard/ativos/manutencoes", roles: ["locador"] },
    ],
    roles: ["admin", "locador", "prefeitura"],
  },
  {
    label: "Frota",
    icon: Truck,
    children: [
      { label: "Painel Frota", href: "/dashboard/frota", roles: ["admin", "locador"] },
      { label: "Veículos", href: "/dashboard/frota/veiculos", roles: ["admin", "locador"] },
      { label: "Ocorrências", href: "/dashboard/frota/ocorrencias", roles: ["admin", "locador"] },
      { label: "Manutenções", href: "/dashboard/frota/manutencoes", roles: ["admin", "locador"] },
    ],
    roles: ["locador"],
  },
  {
    label: "Documentos",
    icon: FileText,
    children: [
      { label: "Painel Documentos", href: "/dashboard/documentos", roles: ["admin", "locador", "locatario", "destino", "prefeitura"] },
      { label: "MTR / CDF / Notas", href: "/dashboard/documentos/listagem", roles: ["admin", "locador", "locatario", "destino", "prefeitura"] },
    ],
    roles: ["admin", "locador", "locatario", "destino", "prefeitura"],
  },
  {
    label: "Obras",
    icon: Building2,
    children: [
      { label: "Painel Obras", href: "/dashboard/obras", roles: ["locatario"] },
      { label: "Listagem de Obras", href: "/dashboard/obras/listagem", roles: ["locatario"] },
    ],
    roles: ["locatario"],
  },
  {
    label: "Financeiro",
    icon: DollarSign,
    children: [
      { label: "Painel Financeiro", href: "/dashboard/financeiro", roles: ["admin", "locador", "destino"] },
      { label: "Gestão Financeira", href: "/dashboard/financeiro/cobrancas", roles: ["admin"] },
      { label: "Cobranças", href: "/dashboard/financeiro/cobrancas", roles: ["destino"] },
      { label: "Minha Conta", href: "/dashboard/financeiro/minha-conta", roles: ["locador"] },
      { label: "Faturamento", href: "/dashboard/financeiro/faturamento", roles: ["locador"] },
      { label: "Transações", href: "/dashboard/financeiro/transacoes", roles: ["locador"] },
      { label: "Extrato", href: "/dashboard/financeiro/extrato", roles: ["locador"] },
      { label: "Faturas", href: "/dashboard/financeiro/faturas", roles: ["locador", "locatario"] },
      { label: "Despesas", href: "/dashboard/financeiro/despesas", roles: ["locatario"] },
    ],
    roles: ["admin", "locatario", "locador", "destino"],
  },
  {
    label: "Logística",
    icon: MapIcon,
    children: [
      { label: "Painel Logístico", href: "/dashboard/logistica", roles: ["locador", "motorista", "prefeitura"] },
      { label: "Minhas Rotas", href: "/dashboard/logistica/rotas", roles: ["motorista"] },
      { label: "Rotas Agendadas", href: "/dashboard/logistica/agendadas", roles: ["locador"] },
      { label: "Agendar Rota", href: "/dashboard/logistica/agendar", roles: ["locador"] },
      { label: "Histórico de Rotas", href: "/dashboard/logistica/historico", roles: ["locador"] },
      { label: "Rastreamento", href: "/dashboard/rastreamento", roles: ["locador", "prefeitura"] },
    ],
    roles: ["locador", "motorista", "prefeitura"],
  },
  {
    label: "Localidades",
    icon: MapPin,
    children: [
      { label: "Estados", href: "/dashboard/localidades/estados" },
      { label: "Cidades", href: "/dashboard/localidades/cidades" },
    ],
    roles: ["admin"],
  },
  {
    label: "Config. Operacionais",
    icon: Settings2,
    children: [
      { label: "Classes de Resíduos", href: "/dashboard/config/residuos" },
      { label: "Tipos de Veículos", href: "/dashboard/config/veiculos" },
      { label: "Tipos de Equipamentos", href: "/dashboard/config/equipamentos" },
      { label: "Modelos de Caçamba", href: "/dashboard/config/modelos-cacamba" },
      { label: "Tecnologias de Tratamento", href: "/dashboard/config/tecnologias" },
      { label: "Formas de Pagamento", href: "/dashboard/config/pagamentos" },
    ],
    roles: ["admin"],
  },
  {
    label: "LGPD",
    icon: ShieldAlert,
    children: [
      { label: "Termos de Uso", href: "/dashboard/lgpd/termos" },
      { label: "Política de Privacidade", href: "/dashboard/lgpd/privacidade" },
      { label: "Aceites dos Usuários", href: "/dashboard/lgpd/aceites" },
    ],
    roles: ["admin"],
  },
  {
    label: "Usuários",
    icon: Users,
    children: [
      { label: "Painel Usuários", href: "/dashboard/usuarios", roles: ["admin", "locador", "locatario", "prefeitura", "destino"] },
      { label: "Listagem", href: "/dashboard/usuarios/listagem", roles: ["admin", "locador", "locatario", "prefeitura", "destino"] },
      { label: "Perfis e Permissões", href: "/dashboard/usuarios/roles", roles: ["admin"] },
    ],
    roles: ["admin", "locador", "locatario", "prefeitura", "destino"],
  },
  {
    label: "Relatórios",
    icon: FileBarChart,
    children: [
      { label: "Locações", href: "/dashboard/relatorios/locacoes", roles: ["locador"] },
      { label: "Locação por Bairro", href: "/dashboard/relatorios/bairro", roles: ["locador", "prefeitura"] },
      { label: "Locação por Obra", href: "/dashboard/relatorios/obra", roles: ["locador", "locatario", "prefeitura"] },
      { label: "Ranking de Clientes", href: "/dashboard/relatorios/ranking", roles: ["locador"] },
      { label: "Performance Motoristas", href: "/dashboard/relatorios/motoristas", roles: ["locador"] },
      { label: "Índice de Satisfação", href: "/dashboard/relatorios/satisfacao", roles: ["locador"] },
      { label: "Coletas Concluídas", href: "/dashboard/relatorios/destino-residuos", roles: ["locador", "locatario"] },
      { label: "Coletas Vencidas", href: "/dashboard/relatorios/vencimento-prazo", roles: ["prefeitura"] },
      { label: "Coletas Concluídas", href: "/dashboard/relatorios/destinacao-residuos", roles: ["prefeitura"] },
      { label: "Classe de resíduos", href: "/dashboard/relatorios/classe-residuos", roles: ["prefeitura"] },
      { label: "Situação locadores", href: "/dashboard/relatorios/situacao-locadores", roles: ["prefeitura"] },
      { label: "Situação destino final", href: "/dashboard/relatorios/situacao-destino", roles: ["prefeitura"] },
      { label: "Quilometragem percorrida", href: "/dashboard/relatorios/quilometragem", roles: ["motorista"] },
      { label: "Roteiros diários realizados", href: "/dashboard/relatorios/roteiros", roles: ["motorista"] },
      { label: "Registro de caçambas", href: "/dashboard/relatorios/registro-cacambas", roles: ["motorista"] },
      { label: "Atrasos e ocorrências registradas", href: "/dashboard/relatorios/atrasos-ocorrencias", roles: ["motorista"] },
      { label: "Resíduos Recebidos", href: "/dashboard/relatorios/destino-residuos", roles: ["destino"] },
      { label: "Caçambas por período", href: "/dashboard/relatorios/registro-cacambas", roles: ["destino"] },
      { label: "Faturamento", href: "/dashboard/financeiro/faturamento", roles: ["destino"] },
      { label: "Clientes", href: "/dashboard/relatorios/ranking", roles: ["destino"] },
    ],
    roles: ["locador", "prefeitura", "locatario", "motorista", "destino"],
  },
];

export const destinoEntityMenuHrefs = new Set([
  "/dashboard/clientes",
  "/dashboard/transportadores",
  "/dashboard/geradores",
]);

export function getFilteredMenuItems(activeProfileType: string | null | undefined): MenuItem[] {
  return menuItems
    .filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(activeProfileType || "");
    })
    .map((item) => {
      const newItem = { ...item };
      if (newItem.children) {
        newItem.children = newItem.children
          .filter((child) => {
            if (activeProfileType === "destino" && item.label === "Entidades") {
              return destinoEntityMenuHrefs.has(child.href);
            }
            if (!child.roles) return true;
            return child.roles.includes(activeProfileType || "");
          })
          .map((child) => {
            if (child.href === "/dashboard/pedidos" && activeProfileType === "locatario") {
              return { ...child, label: "Meus Pedidos" };
            }
            return child;
          });
      }
      return newItem;
    })
    .filter((item) => !item.children || item.children.length > 0 || item.href);
}