# Diagramas UML do Sistema Aether

Este diretório contém os diagramas UML em PlantUML para o sistema Aether.

## Diagramas Disponíveis

### 1. Diagrama Entidade-Relacionamento (40%)
**Arquivo**: `er-diagram.puml`

Representa a estrutura completa do banco de dados com todas as entidades, atributos e relacionamentos.

**Entidades principais**:
- Users (Usuários)
- Teams (Equipes)
- Projects (Projetos)
- Tasks (Tarefas)
- Comments (Comentários)
- Attachments (Anexos)
- Notifications (Notificações)

### 2. Diagrama de Casos de Uso (30%)
**Arquivo**: `use-case-diagram.puml`

Mostra todas as funcionalidades do sistema organizadas por pacotes e os três níveis de usuários (Member, Manager, Admin).

**Pacotes de casos de uso**:
- Autenticação e Autorização (5 casos de uso)
- Gestão de Tarefas/Kanban (10 casos de uso)
- Gestão de Projetos (5 casos de uso)
- Colaboração (8 casos de uso)
- Notificações (3 casos de uso)
- Relatórios e Dashboard (5 casos de uso)
- Administração (5 casos de uso)

**Total**: 41 casos de uso

### 3. Diagramas de Atividade (30%)

#### a) Mover Tarefa no Kanban
**Arquivo**: `activity-diagram.puml`

Fluxo completo de arrastar e soltar uma tarefa entre colunas do Kanban, incluindo:
- Validação de autenticação
- Atualização otimista no frontend
- Persistência no banco de dados
- Notificação em tempo real via WebSocket
- Tratamento de erros

#### b) Criar Nova Tarefa
**Arquivo**: `activity-diagram-create-task.puml`

Fluxo completo de criação de tarefa, incluindo:
- Validação de formulário (frontend e backend)
- Verificação de permissões
- Criação no banco de dados
- Envio de notificações
- Atualização em tempo real

## Como Gerar os Diagramas

### Opção 1: Online (Recomendado)

Acesse [PlantUML Online Editor](https://www.plantuml.com/plantuml/uml/) e cole o conteúdo de cada arquivo `.puml`.

### Opção 2: VS Code

1. Instale a extensão "PlantUML" no VS Code
2. Instale Java (necessário para o PlantUML)
3. Abra o arquivo `.puml`
4. Pressione `Alt+D` para visualizar o diagrama

### Opção 3: Linha de Comando

```bash
# Instalar PlantUML
sudo apt-get install plantuml

# Gerar PNG
plantuml er-diagram.puml
plantuml use-case-diagram.puml
plantuml activity-diagram.puml
plantuml activity-diagram-create-task.puml

# Gerar SVG (melhor qualidade)
plantuml -tsvg er-diagram.puml
plantuml -tsvg use-case-diagram.puml
plantuml -tsvg activity-diagram.puml
plantuml -tsvg activity-diagram-create-task.puml
```

### Opção 4: Docker

```bash
# Gerar todos os diagramas em PNG
docker run -v $(pwd):/data plantuml/plantuml *.puml

# Gerar em SVG
docker run -v $(pwd):/data plantuml/plantuml -tsvg *.puml
```

## Exportar para Documentação

Após gerar as imagens, você pode incluí-las na documentação:

```markdown
## Diagrama ER
![Diagrama Entidade-Relacionamento](diagrams/er-diagram.png)

## Casos de Uso
![Diagrama de Casos de Uso](diagrams/use-case-diagram.png)

## Fluxo de Atividades
![Mover Tarefa](diagrams/activity-diagram.png)
![Criar Tarefa](diagrams/activity-diagram-create-task.png)
```

## Cores e Legendas

### Diagrama ER
- **Verde (#E8F5E9)**: Entidades principais
- **Negrito sublinhado**: Chaves primárias
- **Itálico**: Chaves estrangeiras
- **Negrito**: Campos NOT NULL

### Diagrama de Casos de Uso
- **Azul claro**: Membro (Member)
- **Verde claro**: Gerente (Manager)
- **Coral claro**: Administrador (Admin)
- **Amarelo claro**: Sistema WebSocket

### Diagrama de Atividade
- **Verde**: Atividades principais
- **Laranja**: Pontos de decisão
- **Azul**: Partições (swimlanes)

## Notas Importantes

1. Os diagramas estão em **português** conforme solicitado
2. Todos seguem o padrão UML 2.0
3. PlantUML é baseado em texto, facilitando versionamento
4. Os diagramas são consistentes com a arquitetura implementada

## Manutenção

Ao adicionar novas funcionalidades ao sistema:
1. Atualize o diagrama ER se houver novas entidades
2. Adicione casos de uso no diagrama de casos de uso
3. Crie diagramas de atividade para fluxos complexos

---

**Última atualização**: Novembro 2024
