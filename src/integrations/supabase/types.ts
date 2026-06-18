export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cacamba_fotos: {
        Row: {
          cacamba_id: string
          created_at: string
          id: string
          ordem: number
          url: string
        }
        Insert: {
          cacamba_id: string
          created_at?: string
          id?: string
          ordem?: number
          url: string
        }
        Update: {
          cacamba_id?: string
          created_at?: string
          id?: string
          ordem?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cacamba_fotos_cacamba_id_fkey"
            columns: ["cacamba_id"]
            isOneToOne: false
            referencedRelation: "cacambas"
            referencedColumns: ["id"]
          },
        ]
      }
      cacamba_residuos: {
        Row: {
          cacamba_id: string
          classe: string
        }
        Insert: {
          cacamba_id: string
          classe: string
        }
        Update: {
          cacamba_id?: string
          classe?: string
        }
        Relationships: [
          {
            foreignKeyName: "cacamba_residuos_cacamba_id_fkey"
            columns: ["cacamba_id"]
            isOneToOne: false
            referencedRelation: "cacambas"
            referencedColumns: ["id"]
          },
        ]
      }
      cacamba_unidades: {
        Row: {
          cacamba_id: string
          codigo: string
          created_at: string
          disponivel: boolean
          id: string
          manutencao: boolean
          updated_at: string
        }
        Insert: {
          cacamba_id: string
          codigo: string
          created_at?: string
          disponivel?: boolean
          id?: string
          manutencao?: boolean
          updated_at?: string
        }
        Update: {
          cacamba_id?: string
          codigo?: string
          created_at?: string
          disponivel?: boolean
          id?: string
          manutencao?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cacamba_unidades_cacamba_id_fkey"
            columns: ["cacamba_id"]
            isOneToOne: false
            referencedRelation: "cacambas"
            referencedColumns: ["id"]
          },
        ]
      }
      cacambas: {
        Row: {
          cores: string | null
          created_at: string
          dias_externo: number | null
          dias_interno: number | null
          id: string
          locador_id: string
          material: string | null
          modelo: string
          peso: number | null
          preco_externo: number | null
          preco_interno: number | null
          tipo_locacao: string
          tipo_tampa: string
          updated_at: string
        }
        Insert: {
          cores?: string | null
          created_at?: string
          dias_externo?: number | null
          dias_interno?: number | null
          id?: string
          locador_id: string
          material?: string | null
          modelo: string
          peso?: number | null
          preco_externo?: number | null
          preco_interno?: number | null
          tipo_locacao?: string
          tipo_tampa?: string
          updated_at?: string
        }
        Update: {
          cores?: string | null
          created_at?: string
          dias_externo?: number | null
          dias_interno?: number | null
          id?: string
          locador_id?: string
          material?: string | null
          modelo?: string
          peso?: number | null
          preco_externo?: number | null
          preco_interno?: number | null
          tipo_locacao?: string
          tipo_tampa?: string
          updated_at?: string
        }
        Relationships: []
      }
      carrinho_itens: {
        Row: {
          cacamba_id: string | null
          carrinho_id: string
          created_at: string
          equipamento_id: string | null
          equipment_type: Database["public"]["Enums"]["item_tipo"]
          id: string
          locador_id: string | null
          obra_id: string | null
          observacoes: string | null
          preco_unitario: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          cacamba_id?: string | null
          carrinho_id: string
          created_at?: string
          equipamento_id?: string | null
          equipment_type: Database["public"]["Enums"]["item_tipo"]
          id?: string
          locador_id?: string | null
          obra_id?: string | null
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          cacamba_id?: string | null
          carrinho_id?: string
          created_at?: string
          equipamento_id?: string | null
          equipment_type?: Database["public"]["Enums"]["item_tipo"]
          id?: string
          locador_id?: string | null
          obra_id?: string | null
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrinho_itens_cacamba_id_fkey"
            columns: ["cacamba_id"]
            isOneToOne: false
            referencedRelation: "cacambas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrinho_itens_carrinho_id_fkey"
            columns: ["carrinho_id"]
            isOneToOne: false
            referencedRelation: "carrinhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrinho_itens_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrinho_itens_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      carrinhos: {
        Row: {
          confirmado_at: string | null
          created_at: string
          id: string
          locatario_id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["carrinho_status"]
          updated_at: string
        }
        Insert: {
          confirmado_at?: string | null
          created_at?: string
          id?: string
          locatario_id: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["carrinho_status"]
          updated_at?: string
        }
        Update: {
          confirmado_at?: string | null
          created_at?: string
          id?: string
          locatario_id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["carrinho_status"]
          updated_at?: string
        }
        Relationships: []
      }
      classes_residuo: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          locador_id: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipamento_fotos: {
        Row: {
          created_at: string
          equipamento_id: string
          id: string
          ordem: number
          url: string
        }
        Insert: {
          created_at?: string
          equipamento_id: string
          id?: string
          ordem?: number
          url: string
        }
        Update: {
          created_at?: string
          equipamento_id?: string
          id?: string
          ordem?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipamento_fotos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamento_unidades: {
        Row: {
          codigo: string
          created_at: string
          disponivel: boolean
          equipamento_id: string
          id: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          disponivel?: boolean
          equipamento_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          disponivel?: boolean
          equipamento_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipamento_unidades_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          locador_id: string
          nome: string
          orientacoes_operacao: string | null
          orientacoes_seguranca: string | null
          preco_diario: number | null
          preco_mensal: number | null
          preco_quinzenal: number | null
          preco_semanal: number | null
          tipo_equipamento: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id: string
          nome: string
          orientacoes_operacao?: string | null
          orientacoes_seguranca?: string | null
          preco_diario?: number | null
          preco_mensal?: number | null
          preco_quinzenal?: number | null
          preco_semanal?: number | null
          tipo_equipamento: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id?: string
          nome?: string
          orientacoes_operacao?: string | null
          orientacoes_seguranca?: string | null
          preco_diario?: number | null
          preco_mensal?: number | null
          preco_quinzenal?: number | null
          preco_semanal?: number | null
          tipo_equipamento?: string
          updated_at?: string
        }
        Relationships: []
      }
      formas_pagamento: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          locador_id: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          locador_id?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          locador_id?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      manutencoes_ativos: {
        Row: {
          ativo_codigo: string | null
          ativo_id: string | null
          ativo_tipo: string
          created_at: string
          data_manutencao: string
          descricao: string | null
          id: string
          locador_id: string
          status: string
          tipo: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          ativo_codigo?: string | null
          ativo_id?: string | null
          ativo_tipo: string
          created_at?: string
          data_manutencao?: string
          descricao?: string | null
          id?: string
          locador_id: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          ativo_codigo?: string | null
          ativo_id?: string | null
          ativo_tipo?: string
          created_at?: string
          data_manutencao?: string
          descricao?: string | null
          id?: string
          locador_id?: string
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      manutencoes_frota: {
        Row: {
          created_at: string
          data_manutencao: string
          descricao: string | null
          id: string
          km: number | null
          locador_id: string
          oficina: string | null
          status: string
          tipo: string
          updated_at: string
          valor: number | null
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          data_manutencao?: string
          descricao?: string | null
          id?: string
          km?: number | null
          locador_id: string
          oficina?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number | null
          veiculo_id: string
        }
        Update: {
          created_at?: string
          data_manutencao?: string
          descricao?: string | null
          id?: string
          km?: number | null
          locador_id?: string
          oficina?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          valor?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_frota_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_cacamba: {
        Row: {
          capacidade: string
          created_at: string
          foto_url: string | null
          id: string
          locador_id: string | null
          medida_a: string | null
          medida_b: string | null
          medida_c: string | null
          medida_d: string | null
          medida_e: string | null
          medida_f: string | null
          modelo: string
          preco_minimo: number | null
          updated_at: string
        }
        Insert: {
          capacidade: string
          created_at?: string
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          medida_a?: string | null
          medida_b?: string | null
          medida_c?: string | null
          medida_d?: string | null
          medida_e?: string | null
          medida_f?: string | null
          modelo: string
          preco_minimo?: number | null
          updated_at?: string
        }
        Update: {
          capacidade?: string
          created_at?: string
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          medida_a?: string | null
          medida_b?: string | null
          medida_c?: string | null
          medida_d?: string | null
          medida_e?: string | null
          medida_f?: string | null
          modelo?: string
          preco_minimo?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      obras: {
        Row: {
          bairro: string
          cidade: string
          complemento: string | null
          created_at: string
          data_final_estimada: string
          data_inicio: string
          estado: string
          id: string
          nome: string
          numero: string
          responsavel: string
          rua: string
          status: string
          telefone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro: string
          cidade: string
          complemento?: string | null
          created_at?: string
          data_final_estimada: string
          data_inicio: string
          estado: string
          id?: string
          nome: string
          numero: string
          responsavel: string
          rua: string
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string
          cidade?: string
          complemento?: string | null
          created_at?: string
          data_final_estimada?: string
          data_inicio?: string
          estado?: string
          id?: string
          nome?: string
          numero?: string
          responsavel?: string
          rua?: string
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ocorrencias_ativos: {
        Row: {
          ativo_codigo: string | null
          ativo_id: string | null
          ativo_tipo: string
          created_at: string
          data_ocorrencia: string
          descricao: string | null
          gravidade: string
          id: string
          locador_id: string
          status: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          ativo_codigo?: string | null
          ativo_id?: string | null
          ativo_tipo: string
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          gravidade?: string
          id?: string
          locador_id: string
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          ativo_codigo?: string | null
          ativo_id?: string | null
          ativo_tipo?: string
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          gravidade?: string
          id?: string
          locador_id?: string
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ocorrencias_frota: {
        Row: {
          created_at: string
          data_ocorrencia: string
          descricao: string | null
          gravidade: string
          id: string
          locador_id: string
          status: string
          tipo: string | null
          updated_at: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          gravidade?: string
          id?: string
          locador_id: string
          status?: string
          tipo?: string | null
          updated_at?: string
          veiculo_id: string
        }
        Update: {
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          gravidade?: string
          id?: string
          locador_id?: string
          status?: string
          tipo?: string | null
          updated_at?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_frota_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cacamba_id: string | null
          carrinho_id: string | null
          carrinho_item_id: string | null
          created_at: string
          equipamento_id: string | null
          equipment_type: Database["public"]["Enums"]["item_tipo"]
          id: string
          locador_id: string | null
          locatario_id: string
          numero: number
          obra_id: string | null
          observacoes: string | null
          preco_unitario: number
          quantidade: number
          status: Database["public"]["Enums"]["pedido_status"]
          updated_at: string
          valor_total: number
        }
        Insert: {
          cacamba_id?: string | null
          carrinho_id?: string | null
          carrinho_item_id?: string | null
          created_at?: string
          equipamento_id?: string | null
          equipment_type: Database["public"]["Enums"]["item_tipo"]
          id?: string
          locador_id?: string | null
          locatario_id: string
          numero?: number
          obra_id?: string | null
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cacamba_id?: string | null
          carrinho_id?: string | null
          carrinho_item_id?: string | null
          created_at?: string
          equipamento_id?: string | null
          equipment_type?: Database["public"]["Enums"]["item_tipo"]
          id?: string
          locador_id?: string | null
          locatario_id?: string
          numero?: number
          obra_id?: string | null
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cacamba_id_fkey"
            columns: ["cacamba_id"]
            isOneToOne: false
            referencedRelation: "cacambas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_carrinho_id_fkey"
            columns: ["carrinho_id"]
            isOneToOne: false
            referencedRelation: "carrinhos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_carrinho_item_id_fkey"
            columns: ["carrinho_item_id"]
            isOneToOne: false
            referencedRelation: "carrinho_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      politica_privacidade: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          situacao: string
          titulo: string
          updated_at: string
          upload_por: string | null
          versao: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          situacao?: string
          titulo: string
          updated_at?: string
          upload_por?: string | null
          versao: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          situacao?: string
          titulo?: string
          updated_at?: string
          upload_por?: string | null
          versao?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          bairro: string | null
          celular: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          descricao: string | null
          documento: string
          email: string | null
          email_secundario: string | null
          estado: string | null
          id: string
          logradouro: string | null
          nome: string
          nome_fantasia: string | null
          numero: string | null
          resp_cargo: string | null
          resp_celular: string | null
          resp_cpf: string | null
          resp_departamento: string | null
          resp_email: string | null
          resp_email_secundario: string | null
          resp_nome: string | null
          resp_telefone: string | null
          telefone: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
          tipo_pessoa: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          descricao?: string | null
          documento: string
          email?: string | null
          email_secundario?: string | null
          estado?: string | null
          id: string
          logradouro?: string | null
          nome: string
          nome_fantasia?: string | null
          numero?: string | null
          resp_cargo?: string | null
          resp_celular?: string | null
          resp_cpf?: string | null
          resp_departamento?: string | null
          resp_email?: string | null
          resp_email_secundario?: string | null
          resp_nome?: string | null
          resp_telefone?: string | null
          telefone?: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          bairro?: string | null
          celular?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          descricao?: string | null
          documento?: string
          email?: string | null
          email_secundario?: string | null
          estado?: string | null
          id?: string
          logradouro?: string | null
          nome?: string
          nome_fantasia?: string | null
          numero?: string | null
          resp_cargo?: string | null
          resp_celular?: string | null
          resp_cpf?: string | null
          resp_departamento?: string | null
          resp_email?: string | null
          resp_email_secundario?: string | null
          resp_nome?: string | null
          resp_telefone?: string | null
          telefone?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
          tipo_pessoa?: Database["public"]["Enums"]["tipo_pessoa"]
          updated_at?: string
        }
        Relationships: []
      }
      tecnologias_tratamento: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          locador_id: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          locador_id?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      termos_uso: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          situacao: string
          titulo: string
          updated_at: string
          upload_por: string | null
          versao: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          situacao?: string
          titulo: string
          updated_at?: string
          upload_por?: string | null
          versao: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          situacao?: string
          titulo?: string
          updated_at?: string
          upload_por?: string | null
          versao?: string
        }
        Relationships: []
      }
      tipos_equipamentos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          locador_id: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      tipos_veiculos: {
        Row: {
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          locador_id: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          locador_id?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          locador_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          locador_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          locador_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          ativo: boolean
          combustivel: string | null
          created_at: string
          eixos: number | null
          id: string
          locador_id: string
          lotacao: number | null
          marca: string | null
          modelo: string | null
          motor: string | null
          placa: string
          renavam: string | null
          tara: number | null
          tipo_veiculo: string | null
          updated_at: string
          versao: string | null
        }
        Insert: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          ativo?: boolean
          combustivel?: string | null
          created_at?: string
          eixos?: number | null
          id?: string
          locador_id: string
          lotacao?: number | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          placa: string
          renavam?: string | null
          tara?: number | null
          tipo_veiculo?: string | null
          updated_at?: string
          versao?: string | null
        }
        Update: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          ativo?: boolean
          combustivel?: string | null
          created_at?: string
          eixos?: number | null
          id?: string
          locador_id?: string
          lotacao?: number | null
          marca?: string | null
          modelo?: string | null
          motor?: string | null
          placa?: string
          renavam?: string | null
          tara?: number | null
          tipo_veiculo?: string | null
          updated_at?: string
          versao?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirmar_carrinho: {
        Args: { _carrinho_id: string }
        Returns: {
          cacamba_id: string | null
          carrinho_id: string | null
          carrinho_item_id: string | null
          created_at: string
          equipamento_id: string | null
          equipment_type: Database["public"]["Enums"]["item_tipo"]
          id: string
          locador_id: string | null
          locatario_id: string
          numero: number
          obra_id: string | null
          observacoes: string | null
          preco_unitario: number
          quantidade: number
          status: Database["public"]["Enums"]["pedido_status"]
          updated_at: string
          valor_total: number
        }[]
        SetofOptions: {
          from: "*"
          to: "pedidos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_for_locador: {
        Args: {
          _locador_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "locador"
        | "locatario"
        | "motorista"
        | "prefeitura"
        | "destino"
      carrinho_status: "aberto" | "confirmado" | "cancelado"
      item_tipo: "cacamba" | "equipamento"
      pedido_status:
        | "pendente"
        | "aceito"
        | "em_entrega"
        | "ativo"
        | "finalizado"
        | "cancelado"
        | "recusado"
      tipo_documento: "cpf" | "cnpj"
      tipo_pessoa: "fisica" | "juridica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "locador",
        "locatario",
        "motorista",
        "prefeitura",
        "destino",
      ],
      carrinho_status: ["aberto", "confirmado", "cancelado"],
      item_tipo: ["cacamba", "equipamento"],
      pedido_status: [
        "pendente",
        "aceito",
        "em_entrega",
        "ativo",
        "finalizado",
        "cancelado",
        "recusado",
      ],
      tipo_documento: ["cpf", "cnpj"],
      tipo_pessoa: ["fisica", "juridica"],
    },
  },
} as const
