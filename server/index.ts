import { addDelay } from "./utils";

interface Deferrals {
  done: (reason?: string) => void;
  update: (message: string) => void;
  defer: () => void;
}

type Player = {
  identifiers: { [key: string]: string };
  defferals?: Deferrals;
  source?: number;
};

const MAX_ATTEMPTS = 16;

class Queue {
  attempts = new Map<number, number>();
  connecting: Player[] = [];

  constructor() {
    on("playerConnecting", this.onPlayerConnect);

    setInterval(() => {
      this.updateQueue();
    }, 2_000);
  }

  private getPlayerIdentifiers(source: number): Player {
    const identifiers = {};

    for (let i = 0; i < GetNumPlayerIdentifiers(i); i++) {
      const identifier = GetPlayerIdentifier(String(source), i);
      if (identifier != undefined) {
        const [key, value] = identifier.match(/([^:]+):([^:]+)/);
        identifiers[key] = value;
      }
    }
    return { identifiers };
  }

  async updateQueue() {
    const waitingCount = this.connecting.length;

    this.connecting.forEach((player, pos) => {
      const lastMsg = GetPlayerLastMsg(String(player.source));
      if (lastMsg > 60000) {
        this.connecting.splice(pos, 1);
        player.defferals.done(`Queue timed out, please reconnect!`);
      } else {
        player.defferals.update(
          `Your position in queue ${pos + 1}/${waitingCount}`
        );
      }
    });

    const firstPlayer = this.connecting[0];
    if (!firstPlayer) return;

    const playerCount = GetNumPlayerIndices();
    const maxPlayers = GetConvarInt("sv_maxClients", 1);

    if (playerCount >= maxPlayers) return;

    player.defferals.done();
    this.connecting.splice(0, 1);
  }

  private async onPlayerConnect(
    username: string,
    sKr: (reason: string) => void,
    deferrals: Deferrals,
    source: number = (global as any).source
  ) {
    deferrals.defer();
    await addDelay(250);

    deferrals.update(`Please wait while we connect you to the server!`);

    /* Get the player's endpoint. */
    const endpoint = GetPlayerEndpoint(String(source));
    if (!endpoint) {
      console.log(`no endpoint for [${source}]`);
      return;
    }

    /* Check number of attempts. */
    const attempts = this.attempts.get(source) || 0;
    if (attempts > MAX_ATTEMPTS) {
      deferrals.done(
        `You have tried connectin too many times, please try again later!`
      );
      return false;
    }

    this.attempts.set(source, attempts + 1);

    const player = this.getPlayerIdentifiers(source) as Player;
    player.defferals = deferrals;
    player.source = source;

    /* Add player to the connecting list. */
    const waitingCount = this.connecting.length;
    this.connecting.push(player);
  }
}

new Queue();
