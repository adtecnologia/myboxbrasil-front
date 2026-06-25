
import { useState } from "react";
import { Search, AlertCircle, MessageSquare, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";

const OcorrenciasMotorista = () => {
  const [search, setSearch] = useState("");

  const ocorrencias: { id: string; type: string; client: string; address: string; status: string; severity: string; date: string }[] = [];

  const filtered = ocorrencias.filter(o => 
    o.type.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Minhas Ocorrências" 
        subtitle="Registre e acompanhe problemas em campo"
      />

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por tipo ou ID..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="default" className="gap-2">
          <AlertCircle className="h-4 w-4" /> Nova
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma ocorrência registrada.
            </CardContent>
          </Card>
        )}
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className={`mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  item.severity === "Alta" ? "bg-red-100 text-red-600" : 
                  item.severity === "Média" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                }`}>
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground">{item.id}</span>
                    <Badge variant="outline" className={
                      item.status === "Resolvida" ? "bg-green-50 text-green-600 border-green-200" :
                      item.status === "Aberta" ? "bg-red-50 text-red-600 border-red-200" : ""
                    }>
                      {item.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold truncate">{item.type}</h4>
                  <p className="text-xs text-muted-foreground truncate">{item.client}</p>
                </div>
                <div className="ml-4 text-right">
                  <Badge variant="secondary" className="mb-2">{item.severity}</Badge>
                  <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  <div className="flex justify-end gap-1 mt-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OcorrenciasMotorista;
