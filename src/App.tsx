import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index.tsx";
import Cadastro from "./pages/Cadastro.tsx";
import RecuperarSenha from "./pages/RecuperarSenha.tsx";
import ResetSenha from "./pages/ResetSenha.tsx";
import SelecionarPerfil from "./pages/SelecionarPerfil.tsx";
import DashboardLayout from "./components/DashboardLayout.tsx";
import { SessionInitializer, RequireAuth, RequireProfile } from "./components/AuthGate.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Logistica from "./pages/dashboard/logistica/index.tsx";
import MinhasRotas from "./pages/dashboard/logistica/MinhasRotas.tsx";
import RotasAgendadas from "./pages/dashboard/logistica/RotasAgendadas.tsx";
import AgendarRota from "./pages/dashboard/logistica/AgendarRota.tsx";
import HistoricoRotas from "./pages/dashboard/logistica/HistoricoRotas.tsx";
import Operacional from "./pages/dashboard/Operacional.tsx";
import PainelOperacional from "./pages/dashboard/operacional/PainelOperacional.tsx";
import Clientes from "./pages/dashboard/Clientes.tsx";
import Transportadores from "./pages/dashboard/Transportadores.tsx";
import Geradores from "./pages/dashboard/Geradores.tsx";
import Documentos from "./pages/dashboard/Documentos.tsx";
import Financeiro from "./pages/dashboard/Financeiro.tsx";
import PainelFinanceiro from "./pages/dashboard/financeiro/PainelFinanceiro.tsx";
import Locacoes from "./pages/dashboard/relatorios/Locacoes.tsx";
import LocacoesBairro from "./pages/dashboard/relatorios/LocacoesBairro.tsx";
import LocacoesObra from "./pages/dashboard/relatorios/LocacoesObra.tsx";
import RankingClientes from "./pages/dashboard/relatorios/RankingClientes.tsx";
import PerformanceMotoristas from "./pages/dashboard/relatorios/PerformanceMotoristas.tsx";
import IndiceSatisfacao from "./pages/dashboard/relatorios/IndiceSatisfacao.tsx";
import Notificacoes from "./pages/dashboard/Notificacoes.tsx";
import Perfil from "./pages/dashboard/Perfil.tsx";
import Configuracoes from "./pages/dashboard/Configuracoes.tsx";
import Veiculos from "./pages/dashboard/Veiculos.tsx";
import Prefeituras from "./pages/dashboard/Prefeituras.tsx";
import Destinadores from "./pages/dashboard/Destinadores.tsx";
import Locadores from "./pages/dashboard/usuarios/Locadores.tsx";
import Locatarios from "./pages/dashboard/usuarios/Locatarios.tsx";
import ListagemUsuarios from "./pages/dashboard/usuarios/ListagemUsuarios.tsx";
import Estados from "./pages/dashboard/localidades/Estados.tsx";
import Cidades from "./pages/dashboard/localidades/Cidades.tsx";
import Tecnologias from "./pages/dashboard/config/Tecnologias.tsx";
import ClassesResiduo from "./pages/dashboard/config/ClassesResiduo.tsx";
import TiposVeiculos from "./pages/dashboard/config/TiposVeiculos.tsx";
import TiposEquipamentos from "./pages/dashboard/config/TiposEquipamentos.tsx";
import ModelosCacamba from "./pages/dashboard/config/ModelosCacamba.tsx";
import FormasPagamento from "./pages/dashboard/config/FormasPagamento.tsx";
import TermosUso from "./pages/dashboard/lgpd/TermosUso.tsx";
import PoliticaPrivacidade from "./pages/dashboard/lgpd/PoliticaPrivacidade.tsx";
import AceitesUsuarios from "./pages/dashboard/lgpd/AceitesUsuarios.tsx";
import RolesPermissoes from "./pages/dashboard/usuarios/RolesPermissoes.tsx";
import CacambasAdmin from "./pages/dashboard/usuarios/CacambasAdmin.tsx";
import EquipamentosAdmin from "./pages/dashboard/usuarios/EquipamentosAdmin.tsx";
import PedidosList from "./pages/dashboard/pedidos/PedidosList.tsx";
import PedidoDetalhes from "./pages/dashboard/pedidos/PedidoDetalhes.tsx";
import PedidoMapa from "./pages/dashboard/pedidos/PedidoMapa.tsx";
import OrdensLocacao from "./pages/dashboard/pedidos/OrdensLocacao.tsx";
import Rastreamento from "./pages/dashboard/Rastreamento.tsx";
import Obras from "./pages/dashboard/Obras.tsx";
import SolicitarCacamba from "./pages/dashboard/pedidos/SolicitarCacamba.tsx";
import Carrinho from "./pages/dashboard/pedidos/Carrinho.tsx";
import DestinoResiduos from "./pages/dashboard/relatorios/DestinoResiduos.tsx";
import Despesas from "./pages/dashboard/financeiro/Despesas.tsx";
import Faturas from "./pages/dashboard/financeiro/Faturas.tsx";
import MinhaConta from "./pages/dashboard/financeiro/MinhaConta.tsx";
import Transacoes from "./pages/dashboard/financeiro/Transacoes.tsx";
import Extrato from "./pages/dashboard/financeiro/Extrato.tsx";
import Faturamento from "./pages/dashboard/financeiro/Faturamento.tsx";
import Ocorrencias from "./pages/dashboard/pedidos/Ocorrencias.tsx";
import VencimentoPrazo from "./pages/dashboard/relatorios/VencimentoPrazo.tsx";
import ClasseResiduos from "./pages/dashboard/relatorios/ClasseResiduos.tsx";
import SituacaoLocadores from "./pages/dashboard/relatorios/SituacaoLocadores.tsx";
import SituacaoDestino from "./pages/dashboard/relatorios/SituacaoDestino.tsx";
import Entregas from "./pages/dashboard/operacional/Entregas.tsx";
import Retiradas from "./pages/dashboard/operacional/Retiradas.tsx";
import OcorrenciasMotorista from "./pages/dashboard/operacional/Ocorrencias.tsx";
import Quilometragem from "./pages/dashboard/relatorios/Quilometragem.tsx";
import Roteiros from "./pages/dashboard/relatorios/Roteiros.tsx";
import RegistroCacambas from "./pages/dashboard/relatorios/RegistroCacambas.tsx";
import AtrasosOcorrencias from "./pages/dashboard/relatorios/AtrasosOcorrencias.tsx";
import PainelFrota from "./pages/dashboard/frota/PainelFrota.tsx";
import OcorrenciasFrota from "./pages/dashboard/frota/OcorrenciasFrota.tsx";
import ManutencoesFrota from "./pages/dashboard/frota/ManutencoesFrota.tsx";



import NotFound from "./pages/NotFound.tsx";
import PainelAtivos from "./pages/dashboard/ativos/PainelAtivos.tsx";
import OcorrenciasAtivos from "./pages/dashboard/ativos/OcorrenciasAtivos.tsx";
import ManutencoesAtivos from "./pages/dashboard/ativos/ManutencoesAtivos.tsx";
import PainelDocumentos from "./pages/dashboard/documentos/PainelDocumentos.tsx";
import MinhasLicencas from "./pages/dashboard/documentos/MinhasLicencas.tsx";
import PainelObras from "./pages/dashboard/obras/PainelObras.tsx";
import PainelUsuarios from "./pages/dashboard/usuarios/PainelUsuarios.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionInitializer>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/reset-password" element={<ResetSenha />} />
          <Route path="/selecionar-perfil" element={<RequireAuth><SelecionarPerfil /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><RequireProfile><DashboardLayout /></RequireProfile></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="operacional" element={<PainelOperacional />} />
            <Route path="operacional/entradas" element={<Operacional />} />
            <Route path="operacional/entregas" element={<Entregas />} />
            <Route path="operacional/retiradas" element={<Retiradas />} />
            <Route path="operacional/ocorrencias" element={<OcorrenciasMotorista />} />
            
            <Route path="logistica" element={<Logistica />} />
            <Route path="logistica/rotas" element={<MinhasRotas />} />
            <Route path="logistica/agendadas" element={<RotasAgendadas />} />
            <Route path="logistica/agendar" element={<AgendarRota />} />
            <Route path="logistica/historico" element={<HistoricoRotas />} />
            <Route path="pedidos" element={<PedidosList />} />
            <Route path="pedidos/solicitar" element={<SolicitarCacamba />} />
            <Route path="pedidos/carrinho" element={<Carrinho />} />
            <Route path="pedidos/ordens" element={<OrdensLocacao />} />
            <Route path="pedidos/ocorrencias" element={<Ocorrencias />} />

            <Route path="pedidos/:id" element={<PedidoDetalhes />} />
            <Route path="pedidos/:id/mapa" element={<PedidoMapa />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="locadores" element={<Locadores />} />
            <Route path="transportadores" element={<Transportadores />} />
            <Route path="locatarios" element={<Locatarios />} />
            <Route path="geradores" element={<Geradores />} />
            <Route path="prefeituras" element={<Prefeituras />} />
            <Route path="destinadores" element={<Destinadores />} />
            <Route path="documentos">
              <Route index element={<PainelDocumentos />} />
              <Route path="listagem" element={<Documentos />} />
              <Route path="licencas" element={<MinhasLicencas />} />
            </Route>
            <Route path="financeiro" element={<PainelFinanceiro />} />
            <Route path="financeiro/cobrancas" element={<Financeiro />} />
            <Route path="financeiro/despesas" element={<Despesas />} />
            <Route path="financeiro/faturas" element={<Faturas />} />
            <Route path="financeiro/minha-conta" element={<MinhaConta />} />
            <Route path="financeiro/transacoes" element={<Transacoes />} />
            <Route path="financeiro/extrato" element={<Extrato />} />
            <Route path="financeiro/faturamento" element={<Faturamento />} />
            <Route path="relatorios">
              <Route path="locacoes" element={<Locacoes />} />
              <Route path="bairro" element={<LocacoesBairro />} />
              <Route path="obra" element={<LocacoesObra />} />
              <Route path="ranking" element={<RankingClientes />} />
              <Route path="motoristas" element={<PerformanceMotoristas />} />
              <Route path="satisfacao" element={<IndiceSatisfacao />} />
              <Route path="destino-residuos" element={<DestinoResiduos />} />
              <Route path="vencimento-prazo" element={<VencimentoPrazo />} />
              <Route path="destinacao-residuos" element={<DestinoResiduos />} />
              <Route path="classe-residuos" element={<ClasseResiduos />} />
              <Route path="situacao-locadores" element={<SituacaoLocadores />} />
              <Route path="situacao-destino" element={<SituacaoDestino />} />
              <Route path="quilometragem" element={<Quilometragem />} />
              <Route path="roteiros" element={<Roteiros />} />
              <Route path="registro-cacambas" element={<RegistroCacambas />} />
              <Route path="atrasos-ocorrencias" element={<AtrasosOcorrencias />} />
            </Route>
            <Route path="obras">
              <Route index element={<PainelObras />} />
              <Route path="listagem" element={<Obras />} />
            </Route>
            <Route path="notificacoes" element={<Notificacoes />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="frota">
              <Route index element={<PainelFrota />} />
              <Route path="veiculos" element={<Veiculos />} />
              <Route path="ocorrencias" element={<OcorrenciasFrota />} />
              <Route path="manutencoes" element={<ManutencoesFrota />} />
            </Route>
            <Route path="rastreamento" element={<Rastreamento />} />
            <Route path="ativos">
              <Route index element={<PainelAtivos />} />
              <Route path="cacambas" element={<CacambasAdmin />} />
              <Route path="equipamentos" element={<EquipamentosAdmin />} />
              <Route path="ocorrencias" element={<OcorrenciasAtivos />} />
              <Route path="manutencoes" element={<ManutencoesAtivos />} />
            </Route>
            <Route path="cacambas" element={<CacambasAdmin />} />
            <Route path="equipamentos" element={<EquipamentosAdmin />} />
            <Route path="usuarios">
              <Route index element={<PainelUsuarios />} />
              <Route path="listagem" element={<ListagemUsuarios />} />
              <Route path="roles" element={<RolesPermissoes />} />
            </Route>
            <Route path="localidades">
              <Route path="estados" element={<Estados />} />
              <Route path="cidades" element={<Cidades />} />
            </Route>
            <Route path="config">
              <Route path="residuos" element={<ClassesResiduo />} />
              <Route path="veiculos" element={<TiposVeiculos />} />
              <Route path="equipamentos" element={<TiposEquipamentos />} />
              <Route path="modelos-cacamba" element={<ModelosCacamba />} />
              <Route path="tecnologias" element={<Tecnologias />} />
              <Route path="pagamentos" element={<FormasPagamento />} />
            </Route>
            <Route path="lgpd">
              <Route path="termos" element={<TermosUso />} />
              <Route path="privacidade" element={<PoliticaPrivacidade />} />
              <Route path="aceites" element={<AceitesUsuarios />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </SessionInitializer>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
