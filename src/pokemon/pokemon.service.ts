import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {

      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      
      this.handleExeptions(error)

    }
  }

  async findAll() {
    return await this.pokemonModel.find();
  }

  async findOne(termino: string) {
    
    let pokemon: Pokemon;

    if( !isNaN(+termino) ) {
      pokemon = await this.pokemonModel.findOne({ no: termino });
    }

    if( !pokemon && isValidObjectId(termino) ) {
      pokemon = await this.pokemonModel.findById(termino);
    }

    if(!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: termino.toLocaleLowerCase() });
    }

    if(!pokemon) throw new NotFoundException(`No pokemon found with id ${termino}`);

    return pokemon;

  }

  async update(termino: string, updatePokemonDto: UpdatePokemonDto) {
  
   try {
    
    const pokemon = await this.findOne(termino);

    if(updatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    await pokemon.updateOne(updatePokemonDto, { new: true });

    return {...pokemon.toJSON(), ...updatePokemonDto};

   } catch (error) {
    
    this.handleExeptions(error)

   }

  }

  async remove(id: string) {
    
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if(deletedCount === 0) 
      throw new BadRequestException(`Pokemon not found with id ${id}`);

    return;
  }

  private handleExeptions(error: any) {
    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException('Cant create pokemon, please check your inputs');
  }
}
