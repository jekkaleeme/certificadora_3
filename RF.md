# 1.Requisitos Funcionais

A Tabela 1 a seguir contém os Requisitos Funcionais (RF) elicitados a técnica de Brainstorm

| ID   |                                                      Requisito                                                     | Prioridade | Requisitos Relacionados |
| :--: | :----------------------------------------------------------------------------------------------------------------: | :--------: | :----------------------:|
| RF01 | O sistema deve permitir o login de usuários através de e-mail e senha.                                             | Alta       | -                       |
| RF02 | O sistema deve validar as credenciais de login.                                                                    | Alta       | RF01                    |
| RF03 | O sistema deve permitir logout do usuário autenticado.                                                             | Média      | -                       |
| RF04 | O sistema deve controlar níveis de acesso (administrador, organizador, participante).                              | Baixa      | RF03                    |
| RF05 | O sistema deve restringir o acesso a funcionalidades com base no perfil do usuário.                                | Alta       | RF01, RF03              |
| RF06 | O sistema deve permitir o cadastro de novos eventos (oficina, palestra ou reunião interna).                        | Alta       | RF03                    |
| RF07 | O sistema deve permitir ao usuário selecionar o tipo de evento no momento do cadastro.                             | Média      | RF03, RF04              |
| RF08 | O sistema deve permitir a edição dos dados de um evento.                                                           | Média      | RF06, RF07              |
| RF09 | O sistema deve permitir a exclusão de eventos cadastrados.                                                         | Média      | RF06, RF07              |
| RF10 | O sistema deve exibir uma lista com todos os eventos cadastrados, com filtros por tipo, data, tema e host.         | Alta       | RF06, RF07              |
| RF11 | O sistema deve exibir detalhes de um evento individual ao ser selecionado.                                         | Média      | RF10                    |
| RF12 | O sistema deve permitir configurar o número máximo de vagas para oficinas e palestras.                             | Alta       | RF06, RF07              |
| RF13 | O sistema deve impedir novas inscrições quando o número máximo de vagas for atingido.                              | Alta       | RF12                    |
| RF14 | O sistema deve permitir marcar eventos como públicos ou privados (reuniões internas).                              | Média      | RF06, RF07              |
| RF15 | O sistema deve permitir que visitantes se inscrevam em eventos públicos (oficinas e palestras).                    | Alta       | RF14                    |
| RF16 | O sistema deve coletar dados básicos do participante no momento da inscrição (nome, e-mail, telefone).             | Alta       | RF15                    |
| RF17 | O sistema deve verificar se há vagas disponíveis antes de confirmar uma inscrição.                                 | Alta       | RF12, RF13              |
| RF18 | O sistema deve armazenar a lista de inscritos para cada evento.                                                    | Alta       | RF16, RF17              |
| RF19 | O sistema deve permitir que organizadores visualizem e exportem a lista de inscritos.                              | Alta       | RF18                    |
| RF20 | O sistema deve permitir que reuniões internas sejam visíveis apenas para usuários autenticados com permissão.      | Alta       | RF04, RF14              |
| RF21 | O sistema deve permitir confirmar a presença manual ou automaticamente para reuniões internas (check-in).          | Média      | RF20                    |
| RF22 | O sistema deve permitir o cadastro de novos usuários com diferentes níveis de acesso.                              | Alta       | RF04                    |
| RF23 | O sistema deve permitir a edição dos dados de usuário (nome, e-mail, senha, perfil).                               | Alta       | RF22                    |
| RF24 | O sistema deve permitir a exclusão de usuários (restrito a administradores).                                       | Alta       | RF22                    |
| RF25 | O sistema deve permitir a redefinição de senha.                                                                    | Média      | RF01, RF23              |
| RF26 | O sistema deve exibir estatísticas de eventos cadastrados (por tipo, mês, host, etc.).                             | Média      | RF10                    |
| RF27 | O sistema deve exibir o número total de inscritos por evento.                                                      | Alta       | RF18                    |
| RF28 | O sistema deve permitir exportar listas de eventos e inscritos em formatos como PDF ou Excel.                      | Alta       | RF19, RF26, RF27        |
| RF29 | O sistema deve permitir a busca por eventos pelo título, data, host ou local.                                      | Média      | RF10                    |
| RF30 | O sistema deve exibir uma agenda com os eventos futuros e passados.                                                | Alta       | RF10, RF29              |
| RF31 | O sistema deve exibir um aviso quando não houver eventos disponíveis para inscrição.                               | Média      | RF10, RF30              |
| RF32 | O sistema deve impedir o cadastro de eventos com datas/horários em conflito para o mesmo local ou host.            | Alta       | RF06, RF07              |
| RF33 | O sistema deve manter um histórico dos eventos realizados.                                                         | Média      | RF10, RF30              |
| RF34 | O sistema deve permitir adicionar materiais complementares ao evento (como anexos ou links externos).              | Média      | RF06, RF07, RF10        |


Tabela 1: Requisitos Funcionais

# 2. Referências

- [Voltar ao inicio](https://github.com/jekkaleeme/certificadora_3/blob/main/README.md) 
