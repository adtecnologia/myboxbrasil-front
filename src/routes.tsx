// react libraries
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
// register
import Register from './app/cadastrese';
// login
import Login from './app/login';
// panel
import Panel from './app/painel';
// cart
import Cart from './app/painel/carrinho';
import CartView from './app/painel/carrinho/view';
// config
import Config from './app/painel/configuracoes';
// dashboard
import Dashboard from './app/painel/dashboard';
import FinancialExtrato from './app/painel/financeiro/extrato';
import FinancialMinhaConta from './app/painel/financeiro/minhasinformacoes';
// financial
import FinancialResume from './app/painel/financeiro/resumo';
import FinancialTransacoes from './app/painel/financeiro/transacoes';
// my profile
import MyProfile from './app/painel/meuperfil';
// notifications
import Notifications from './app/painel/notificacoes';
// order
import Order from './app/painel/pedidos';
import OrderDetails from './app/painel/pedidos/details';
// place order
import PlaceOrder from './app/painel/pedircacamba';
import PlaceOrderStationary from './app/painel/pedircacamba/stationary';
// stationary bucket
import StationaryBucketList from './app/painel/produtos/cacambas';
// stationary bucket itens
import StationaryBucketItensForm from './app/painel/produtos/cacambas/itens/form';
// vehicle
import VehicleList from './app/painel/veiculos';
import VehicleForm from './app/painel/veiculos/form';
// profile
import Profile from './app/profile';
// components
import Redirect from './components/Redirect';

// stationary bucket gallery

import FinishRegister from './app/concluircadastrase';
import Forgot from './app/esqueceusenha';
// city
import CityList from './app/painel/dadosdosistema/cidades';
// state
import StateList from './app/painel/dadosdosistema/estados';
// model
import StationaryBucketModelList from './app/painel/dadosdosistema/modelosdecacamba';
import StationaryBucketModelItensList from './app/painel/dadosdosistema/modelosdecacamba/cacambas';
import StationaryBucketModelForm from './app/painel/dadosdosistema/modelosdecacamba/form';
// residue class
import ResidueList from './app/painel/dadosdosistema/residuos';
import ResidueForm from './app/painel/dadosdosistema/residuos/form';
// data system
// residue tecnology
import TecnologyList from './app/painel/dadosdosistema/tecnologiatratamento';
import TecnologyForm from './app/painel/dadosdosistema/tecnologiatratamento/form';
// vehicle type
import VehicleTypeList from './app/painel/dadosdosistema/tiposdeveiculo';
import VehicleTypeForm from './app/painel/dadosdosistema/tiposdeveiculo/form';
import MtrPage from './app/painel/documento/mtr';
import EmAnaliseList from './app/painel/FuncoesDestinoFinal/Analises';
import AguardandoRetiradaList from './app/painel/FuncoesLocador/AguardandoRetirada';
import AguardandoRetiradaMapa from './app/painel/FuncoesLocador/AguardandoRetirada/mapa';
import EmTransitoDescarteList from './app/painel/FuncoesLocador/EmTransitoDescarte';
import EmTransitoLocacaoList from './app/painel/FuncoesLocador/EmTransitoLocacao';
import EmTransitoLocacaoMapa from './app/painel/FuncoesLocador/EmTransitoLocacao/mapa';
import EntregasPendentesList from './app/painel/FuncoesLocador/EntregasPendentes';
import EntregasPendentesMapa from './app/painel/FuncoesLocador/EntregasPendentes/mapa';
import LocadasList from './app/painel/FuncoesLocador/Locadas';
import OrdemLocacaoList from './app/painel/FuncoesLocador/OrdensLocacao';
import PedidosDetalhes from './app/painel/FuncoesLocador/Pedidos/Detail';

import PedidosList from './app/painel/FuncoesLocador/Pedidos/List';
import PedidosMapa from './app/painel/FuncoesLocador/Pedidos/Mapa';
import MinhasCacambas from './app/painel/FuncoesLocatario/MinhasCacambas';
import MinhasEntregas from './app/painel/FuncoesMotorista/MinhasEntregas';
import MinhasEntregasMapa from './app/painel/FuncoesMotorista/MinhasEntregas/mapa';
import MinhasRetiradas from './app/painel/FuncoesMotorista/MinhasRetiradas';
import MinhasRetiradasMapa from './app/painel/FuncoesMotorista/MinhasRetiradas/mapa';
import AcceptList from './app/painel/lgpd/aceites';
import PrivacyPolicyList from './app/painel/lgpd/politicadeprivacidade';
import TermOfUseList from './app/painel/lgpd/termosdeuso';
import ReportList from './app/painel/ocorrencias';
import ReportForm from './app/painel/ocorrencias/form';
import ReportView from './app/painel/ocorrencias/view';
import OrdemLocacaoCDFEmitido from './app/painel/ordenslocacao/cdfemitido';
import OrdemLocacaoEmAnalise from './app/painel/ordenslocacao/emanalise';
import OrdemLocacaoEmProcessamento from './app/painel/ordenslocacao/emprocessamento';
import OrdemLocacaoEmTransito from './app/painel/ordenslocacao/emtransito';
import OrdemLocacaoEntregaPendente from './app/painel/ordenslocacao/entregapendente';
import OrdemLocacaoLocada from './app/painel/ordenslocacao/locada';
import OrdemLocacaoMapa from './app/painel/ordenslocacao/map';
import StationaryBucketTabs from './app/painel/produtos/cacambas/tabs';
import RastreamentoPage from './app/painel/rastreamento';
import RelatorioCacambasColetadas from './app/painel/relatorios/cacambas-coletadas';
import RelatorioClasseDeResiduos from './app/painel/relatorios/classe-de-residuos';
import RelatorioLocacoes from './app/painel/relatorios/locacoes';
import RelatorioLocacoesPorBairro from './app/painel/relatorios/locacoes-por-bairro';
import RelatorioLocacoesPorObra from './app/painel/relatorios/locacoes-por-obra';
import RelatorioRankingClientes from './app/painel/relatorios/ranking-clientes';
import RelatorioSituacaoLocadores from './app/painel/relatorios/situacao-lcoadores';
import RelatorioVencimentoPrazo from './app/painel/relatorios/vencimento-prazo';
// users
// final destination
import FinalDestinationList from './app/painel/usuarios/destinofinal';
import FinalDestinationForm from './app/painel/usuarios/destinofinal/form';
import DestinoValidacaoForm from './app/painel/usuarios/destinofinal/validacao';
// team
import TeamList from './app/painel/usuarios/equipe';
import TeamForm from './app/painel/usuarios/equipe/form';
import TaxList from './app/painel/usuarios/fiscais';
import TaxForm from './app/painel/usuarios/fiscais/form';
// landlord
import LandlordList from './app/painel/usuarios/locadores';
import LandlordForm from './app/painel/usuarios/locadores/form';
import LocadorValidacaoForm from './app/painel/usuarios/locadores/validacao';
// tenant
import TenantList from './app/painel/usuarios/locatarios';
import TenantForm from './app/painel/usuarios/locatarios/form';
// driver
import DriverList from './app/painel/usuarios/motorista';
import DriverForm from './app/painel/usuarios/motorista/form';
import CityhallList from './app/painel/usuarios/prefeituras';
import CityhallForm from './app/painel/usuarios/prefeituras/form';
import CityhallPopular from './app/painel/usuarios/prefeituras/popular';
import LoadItem from './components/LoadItem';

const RoutesStack = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* auth */}
        <Route element={<Login />} path="" />
        <Route element={<Register />} path="cadastrese" />
        <Route element={<Forgot />} path="esqueceuasenha" />
        <Route element={<FinishRegister />} path="cadastrese/:token" />
        <Route element={<Profile />} path="profile" />

        {/* painel */}
        <Route element={<Panel />} path="painel">
          {/* redirect */}
          <Route element={<Redirect />} path="" />

          {/* dashboard */}
          <Route element={<Dashboard />} path="dashboard" />

          {/* financial */}
          <Route element={<FinancialResume />} path="financeiro&resumo" />
          <Route
            element={<FinancialTransacoes />}
            path="financeiro&transacoes"
          />
          <Route
            element={<FinancialMinhaConta />}
            path="financeiro&minhaconta"
          />
          <Route element={<FinancialExtrato />} path="financeiro&extrato" />

          {/* profile */}
          <Route element={<MyProfile />} path="meuperfil" />

          {/* notifications */}
          <Route element={<Notifications />} path="notificacoes" />

          {/* config */}
          <Route element={<Config />} path="configuracoes" />

          {/* cart */}
          <Route element={<Outlet />} path="carrinho">
            <Route element={<Cart />} path="" />
            <Route element={<CartView />} path=":ID" />
          </Route>

          {/* order */}
          <Route element={<Outlet />} path="pedidos">
            <Route
              element={
                <Order path="order_location" permission="pdd" type="list" />
              }
              path=""
            />
            <Route
              element={
                <OrderDetails
                  path="order_location"
                  permission="pdd"
                  type="list"
                />
              }
              path=":ID/detalhes"
            />
          </Route>

          {/* vehicle */}
          <Route element={<Outlet />} path="veiculos">
            <Route
              element={
                <VehicleList path="vehicle" permission="vcl" type="list" />
              }
              path=""
            />
            <Route
              element={
                <VehicleList path="vehicle" permission="vcl" type="trash" />
              }
              path="lixeira"
            />
            <Route
              element={
                <VehicleForm path="vehicle" permission="vcl" type="add" />
              }
              path="novo"
            />
            <Route
              element={
                <VehicleForm path="vehicle" permission="vcl" type="edit" />
              }
              path=":ID"
            />
          </Route>

          <Route
            element={
              <RastreamentoPage path="routes" permission="rou" type="list" />
            }
            path="rastreamento"
          />
          <Route element={<Outlet />} path="ocorrencias">
            <Route
              element={
                <ReportList path="report" permission="ocr" type="list" />
              }
              path=""
            />
            <Route
              element={<ReportForm path="report" permission="ocr" type="add" />}
              path="novo"
            />
            <Route
              element={
                <ReportView path="report" permission="ocr" type="list" />
              }
              path=":ID"
            />
          </Route>

          {/* place order */}
          <Route element={<Outlet />} path="pedirlocacao">
            <Route element={<PlaceOrder />} path="" />
            <Route
              element={<PlaceOrderStationary />}
              path="cacamba/:ID/:TYPE?"
            />
          </Route>

          {/* order location */}
          <Route
            element={
              <OrdemLocacaoEntregaPendente
                path="order_location_product"
                permission="ord.agr"
                type="list"
              />
            }
            path="ordensdelocacao&entregapendente"
          />
          <Route
            element={
              <OrdemLocacaoEmTransito
                path="order_location_product"
                permission="ord.ent"
                type="list"
              />
            }
            path="ordensdelocacao&emtransito"
          />
          <Route
            element={
              <OrdemLocacaoCDFEmitido
                path="order_location_product"
                permission="ord.cdf"
                type="list"
              />
            }
            path="ordensdelocacao&cdfemitido"
          />
          <Route
            element={
              <OrdemLocacaoLocada
                path="order_location_product"
                permission="ord.lcd"
                type="list"
              />
            }
            path="ordensdelocacao&locada"
          />
          <Route
            element={
              <OrdemLocacaoEmProcessamento
                path="order_location_product"
                permission="ord.prc"
                type="list"
              />
            }
            path="ordensdelocacao&emprocessamento"
          />
          <Route
            element={
              <OrdemLocacaoEmAnalise
                path="order_location_product"
                permission="ord.anl"
                type="list"
              />
            }
            path="ordensdelocacao&emanalise"
          />
          <Route element={<OrdemLocacaoMapa />} path=":TIPO/:ID/mapa" />

          {/* documents */}
          {/* mtr */}
          <Route
            element={<MtrPage path="mtr" permission="mtr" type="list" />}
            path="documentos"
          />
          {/* <Route path="documentos&cdf" element={<CdfPage type="list" path="cdf" permission="cdf" />}></Route> */}
          {/* lgpd */}
          {/* mtr */}
          <Route
            element={
              <AcceptList path="lgpd_acceptance" permission="acp" type="list" />
            }
            path="lgpd&aceites"
          />
          <Route
            element={
              <TermOfUseList path="term_of_use" permission="trm" type="list" />
            }
            path="lgpd&termosdeuso"
          />
          <Route
            element={
              <PrivacyPolicyList
                path="privacy_policy"
                permission="plt"
                type="list"
              />
            }
            path="lgpd&politicadeprivacidade"
          />

          {/* products */}
          {/* stationary bucket */}
          <Route
            element={<LoadItem title="Conteúdo ainda não disponível" />}
            path="produtos&andaimes&cadastros"
          />
          <Route
            element={<LoadItem title="Conteúdo ainda não disponível" />}
            path="produtos&betoneiras&cadastros"
          />
          <Route
            element={<LoadItem title="Conteúdo ainda não disponível" />}
            path="relatorios&contatos"
          />
          <Route
            element={<LoadItem title="Conteúdo ainda não disponível" />}
            path="produtos&empilhadeiras&cadastros"
          />
          <Route element={<Outlet />} path="produtos&cacambas&cadastros">
            <Route
              element={
                <StationaryBucketList
                  path="stationary_bucket_group"
                  permission="cmb"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <StationaryBucketList
                  path="stationary_bucket_group"
                  permission="cmb"
                  type="trash"
                />
              }
              path="lixeira"
            />
            <Route
              element={
                <StationaryBucketTabs path="" permission="cmb" type="add" />
              }
              path="novo"
            />
            <Route element={<Outlet />} path=":ID">
              <Route
                element={
                  <StationaryBucketTabs path="" permission="cmb" type="edit" />
                }
                path=""
              />
              <Route element={<Outlet />} path="itens">
                <Route
                  element={
                    <StationaryBucketItensForm
                      path="stationary_bucket"
                      permission="cmb"
                      type="add"
                    />
                  }
                  path="novo"
                />
                <Route
                  element={
                    <StationaryBucketItensForm
                      path="stationary_bucket"
                      permission="cmb"
                      type="edit"
                    />
                  }
                  path=":ID2"
                />
              </Route>
            </Route>
          </Route>

          {/* users */}
          {/* final destination */}
          <Route element={<Outlet />} path="usuarios&destinofinal">
            <Route
              element={
                <FinalDestinationList
                  path="final_destination"
                  permission="dtf"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <FinalDestinationList
                  path="final_destination"
                  permission="dtf"
                  type="trash"
                />
              }
              path="lixeira"
            />
            <Route
              element={
                <FinalDestinationForm
                  path="final_destination"
                  permission="dtf"
                  type="add"
                />
              }
              path="novo"
            />
            <Route
              element={
                <FinalDestinationForm
                  path="final_destination"
                  permission="dtf"
                  type="edit"
                />
              }
              path=":ID"
            />
            <Route
              element={
                <DestinoValidacaoForm
                  path="final_destination"
                  permission="dtf"
                  type="edit"
                />
              }
              path=":ID/validacao"
            />
          </Route>
          {/* landlord */}
          <Route element={<Outlet />} path="usuarios&locadores">
            <Route
              element={
                <LandlordList path="provider" permission="lcd" type="list" />
              }
              path=""
            />
            <Route
              element={
                <LandlordList path="provider" permission="lcd" type="trash" />
              }
              path="lixeira"
            />
            <Route
              element={
                <LandlordForm path="provider" permission="lcd" type="add" />
              }
              path="novo"
            />
            <Route
              element={
                <LandlordForm path="provider" permission="lcd" type="edit" />
              }
              path=":ID"
            />
            <Route
              element={
                <LocadorValidacaoForm
                  path="provider"
                  permission="lcd"
                  type="edit"
                />
              }
              path=":ID/validacao"
            />
          </Route>
          {/* tenant */}
          <Route element={<Outlet />} path="usuarios&locatarios">
            <Route
              element={
                <TenantList path="client" permission="lct" type="list" />
              }
              path=""
            />
            <Route
              element={
                <TenantList path="client" permission="lct" type="trash" />
              }
              path="lixeira"
            />
            <Route
              element={<TenantForm path="client" permission="lct" type="add" />}
              path="novo"
            />
            <Route
              element={
                <TenantForm path="client" permission="lct" type="edit" />
              }
              path=":ID"
            />
          </Route>
          {/* team */}
          <Route element={<Outlet />} path="usuarios&equipe">
            <Route
              element={<TeamList path="team" permission="eqp" type="list" />}
              path=""
            />
            <Route
              element={<TeamList path="team" permission="eqp" type="trash" />}
              path="lixeira"
            />
            <Route
              element={<TeamForm path="team" permission="eqp" type="add" />}
              path="novo"
            />
            <Route
              element={<TeamForm path="team" permission="eqp" type="edit" />}
              path=":ID"
            />
          </Route>
          {/* driver */}
          <Route element={<Outlet />} path="usuarios&motoristas">
            <Route
              element={
                <DriverList path="driver" permission="mot" type="list" />
              }
              path=""
            />
            <Route
              element={
                <DriverList path="driver" permission="mot" type="trash" />
              }
              path="lixeira"
            />
            <Route
              element={<DriverForm path="driver" permission="mot" type="add" />}
              path="novo"
            />
            <Route
              element={
                <DriverForm path="driver" permission="mot" type="edit" />
              }
              path=":ID"
            />
          </Route>
          {/* tax */}
          <Route element={<Outlet />} path="usuarios&fiscais">
            <Route
              element={<TaxList path="tax" permission="tax" type="list" />}
              path=""
            />
            <Route
              element={<TaxList path="tax" permission="tax" type="trash" />}
              path="lixeira"
            />
            <Route
              element={<TaxForm path="tax" permission="tax" type="add" />}
              path="novo"
            />
            <Route
              element={<TaxForm path="tax" permission="tax" type="edit" />}
              path=":ID"
            />
          </Route>
          {/* city hall */}
          <Route element={<Outlet />} path="usuarios&prefeituras">
            <Route
              element={
                <CityhallList path="cityhall" permission="hal" type="list" />
              }
              path=""
            />
            <Route
              element={
                <CityhallForm path="cityhall" permission="hal" type="add" />
              }
              path=":ID"
            />
            <Route
              element={
                <CityhallPopular path="cityhall" permission="hal" type="add" />
              }
              path=":ID/populardados"
            />
            <Route
              element={
                <CityhallForm path="cityhall" permission="hal" type="edit" />
              }
              path=":ID/:USER"
            />
          </Route>

          {/* data system */}
          {/* city */}
          <Route element={<Outlet />} path="dadossistema&cidades">
            <Route
              element={<CityList path="city" permission="cdd" type="list" />}
              path=""
            />
          </Route>
          {/* state */}
          <Route element={<Outlet />} path="dadossistema&estados">
            <Route
              element={<StateList path="state" permission="std" type="list" />}
              path=""
            />
          </Route>
          {/* residue class */}
          <Route element={<Outlet />} path="dadossistema&residuos">
            <Route
              element={
                <ResidueList path="residue" permission="rsd" type="list" />
              }
              path=""
            />
            <Route
              element={
                <ResidueList path="residue" permission="rsd" type="trash" />
              }
              path="lixeira"
            />
            <Route
              element={
                <ResidueForm path="residue" permission="rsd" type="add" />
              }
              path="novo"
            />
            <Route
              element={
                <ResidueForm path="residue" permission="rsd" type="edit" />
              }
              path=":ID"
            />
          </Route>
          {/* residue class */}
          <Route element={<Outlet />} path="dadossistema&modelosdecacamba">
            <Route
              element={
                <StationaryBucketModelList
                  path="stationary_bucket_type"
                  permission="mcm"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <StationaryBucketModelList
                  path="stationary_bucket_type"
                  permission="mcm"
                  type="trash"
                />
              }
              path="lixeira"
            />
            <Route
              element={
                <StationaryBucketModelForm
                  path="stationary_bucket_type"
                  permission="mcm"
                  type="add"
                />
              }
              path="novo"
            />
            <Route
              element={
                <StationaryBucketModelForm
                  path="stationary_bucket_type"
                  permission="mcm"
                  type="edit"
                />
              }
              path=":ID"
            />
            <Route
              element={
                <StationaryBucketModelItensList
                  path="stationary_bucket_type"
                  permission="mcm"
                  type="edit"
                />
              }
              path=":ID/cacambas"
            />
          </Route>
          {/* vehicle type */}
          <Route element={<Outlet />} path="dadossistema&tiposdeveiculos">
            <Route
              element={
                <VehicleTypeList
                  path="vehicle_type"
                  permission="tvc"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <VehicleTypeList
                  path="vehicle_type"
                  permission="tvc"
                  type="trash"
                />
              }
              path="lixeira"
            />
            <Route
              element={
                <VehicleTypeForm
                  path="vehicle_type"
                  permission="tvc"
                  type="add"
                />
              }
              path="novo"
            />
            <Route
              element={
                <VehicleTypeForm
                  path="vehicle_type"
                  permission="tvc"
                  type="edit"
                />
              }
              path=":ID"
            />
          </Route>
          {/* residue tecnology */}
          <Route element={<Outlet />} path="dadossistema&tecnologiatratamento">
            <Route
              element={
                <TecnologyList
                  path="residue_tecnology"
                  permission="tec"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <TecnologyList
                  path="residue_tecnology"
                  permission="tec"
                  type="trash"
                />
              }
              path="lixeira"
            />
            <Route
              element={
                <TecnologyForm
                  path="residue_tecnology"
                  permission="tec"
                  type="add"
                />
              }
              path="novo"
            />
            <Route
              element={
                <TecnologyForm
                  path="residue_tecnology"
                  permission="tec"
                  type="edit"
                />
              }
              path=":ID"
            />
          </Route>
          {/* FUNCOES LOCATARIO */}
          {/* MINHAS CAÇAMBAS */}
          <Route
            element={
              <MinhasCacambas
                path="stationary_bucket"
                permission="mpd"
                type="list"
              />
            }
            path="minhascacambas"
          />
          {/* FUNÇOES MOTORISTA */}
          {/* ENTREGAS AGENDADAS */}
          <Route element={<Outlet />} path="entregasagendadas">
            <Route
              element={
                <MinhasEntregas
                  path="stationary_bucket"
                  permission="eta"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <MinhasEntregasMapa
                  path="stationary_bucket"
                  permission="eta"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>
          <Route
            element={
              <EmAnaliseList
                path="stationary_bucket"
                permission="eta"
                type="list"
              />
            }
            path="analises"
          />

          {/* RETIRADAS AGENDADAS */}
          <Route element={<Outlet />} path="retiradasagendadas">
            <Route
              element={
                <MinhasRetiradas
                  path="stationary_bucket"
                  permission="eta"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <MinhasRetiradasMapa
                  path="stationary_bucket"
                  permission="eta"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>
          {/* FUNCOES LOCADOR */}
          <Route element={<OrdemLocacaoList />} path="ordemlocacao">
            <Route path="" />
          </Route>

          {/* PEDIDOS CAÇAMBA */}
          <Route element={<Outlet />} path="pedidoscacamba">
            <Route
              element={
                <PedidosList
                  path="order_location"
                  permission="lcc"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <PedidosDetalhes
                  path="order_location"
                  permission="lcc"
                  type="list"
                />
              }
              path=":ID/detalhes"
            />
            <Route
              element={
                <PedidosMapa
                  path="order_location"
                  permission="lcc"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>
          {/* ENTREGAS PENDENTES */}
          <Route element={<Outlet />} path="entregaspendentes">
            <Route
              element={
                <EntregasPendentesList
                  path="stationary_bucket"
                  permission="lcc"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <EntregasPendentesMapa
                  path="order_location"
                  permission="lcc"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>
          {/* EM TRANSITO */}
          <Route element={<Outlet />} path="emtransitolocacao">
            <Route
              element={
                <EmTransitoLocacaoList
                  path="stationary_bucket"
                  permission="lcc"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <EmTransitoLocacaoMapa
                  path="stationary_bucket"
                  permission="lcc"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>
          {/* EM TRANSITO */}
          <Route
            element={
              <EmTransitoDescarteList
                path="stationary_bucket"
                permission="lcc"
                type="list"
              />
            }
            path="emtransitodescarte"
          />
          {/* LOCADAS */}
          <Route
            element={
              <LocadasList
                path="stationary_bucket"
                permission="lcc"
                type="list"
              />
            }
            path="locadas"
          />
          {/* AGUARDANDO RETIRADA */}
          <Route element={<Outlet />} path="aguardandoretirada">
            <Route
              element={
                <AguardandoRetiradaList
                  path="stationary_bucket"
                  permission="lcc"
                  type="list"
                />
              }
              path=""
            />
            <Route
              element={
                <AguardandoRetiradaMapa
                  path="stationary_bucket"
                  permission="lcc"
                  type="list"
                />
              }
              path=":ID/mapa"
            />
          </Route>

          <Route element={<RelatorioLocacoes />} path="relatorios&locacoes" />
          <Route
            element={<RelatorioLocacoesPorBairro />}
            path="relatorios&porbairro"
          />
          <Route
            element={<RelatorioLocacoesPorObra />}
            path="relatorios&porobra"
          />
          <Route
            element={<RelatorioRankingClientes />}
            path="relatorios&ranking"
          />
          <Route
            element={<RelatorioVencimentoPrazo />}
            path="relatorios&vencimentoprazo"
          />
          <Route
            element={<RelatorioCacambasColetadas />}
            path="relatorios&destinacaoresiduos"
          />
          <Route
            element={<RelatorioClasseDeResiduos />}
            path="relatorios&classesderesiduos"
          />
          <Route
            element={<RelatorioSituacaoLocadores />}
            path="relatorios&situacaolocadores"
          />

          <Route element={<Navigate to="/painel" />} path="*" />
        </Route>

        <Route element={<Navigate to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
};

export default RoutesStack;
