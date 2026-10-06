/**
 * Historial de navegación con respaldo en memoria.
 *
 * Usa la History API cuando está disponible. Si el entorno la bloquea (p. ej.
 * un iframe con sandbox), mantiene una pila propia para que la navegación
 * interna (ficha y «Volver») siga funcionando, aunque la URL no cambie.
 */
interface Entry<S> {
  state: S;
  search: string;
}

export class AppHistory<S extends object> {
  private memory: Entry<S>[] | null = null;

  constructor(private readonly onBack: () => void) {
    try {
      history.scrollRestoration = 'manual';
    } catch {
      /* sin efecto: solo afecta a la restauración automática */
    }
  }

  get search(): string {
    return this.memory ? this.memory[this.memory.length - 1]!.search : location.search;
  }

  get state(): Partial<S> {
    if (this.memory) return this.memory[this.memory.length - 1]!.state;
    return (history.state as Partial<S> | null) ?? {};
  }

  replace(state: S | Partial<S>, search = this.search): void {
    if (!this.memory) {
      try {
        history.replaceState(state, '', search || location.pathname);
        return;
      } catch {
        this.memory = [{ state: {} as S, search: location.search }];
      }
    }
    this.memory[this.memory.length - 1] = { state: state as S, search };
  }

  push(state: S, search: string): void {
    if (!this.memory) {
      try {
        history.pushState(state, '', search || location.pathname);
        return;
      } catch {
        this.memory = [{ state: (history.state as S | null) ?? ({} as S), search: location.search }];
      }
    }
    this.memory.push({ state, search });
  }

  back(): void {
    if (!this.memory) {
      history.back(); // dispara popstate
      return;
    }
    if (this.memory.length > 1) this.memory.pop();
    this.onBack();
  }
}
