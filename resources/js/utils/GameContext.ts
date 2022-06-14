import { createContext } from 'react';
import { GameDetails } from '../models/Game';

const GameContext = createContext<GameDetails | undefined>(undefined);
export default GameContext;
