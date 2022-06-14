import { createContext } from 'react';
import { CategoryDetails } from '../models/Category';

const GameContext = createContext<CategoryDetails | undefined>(undefined);
export default GameContext;
