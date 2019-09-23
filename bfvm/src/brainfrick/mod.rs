use std::io;
use std::io::prelude::*;

pub enum Instruction {
    Add(u8),
    Subtract(u8),
    Move(isize),
    Loop(usize),
    Write,
    Read
}

pub fn parse(code: &String) -> Result< Vec<Instruction>, &str > {
    let mut clear = code.chars().filter(|ch| match ch {
        '+' | '-' | '>' | '<' | '[' | ']' | '.' | ',' => true,
        _ => false 
    }).peekable();

    let mut code  = vec![];
    let mut stack = vec![];

    while clear.peek().is_some() {
        let ch = clear.next().unwrap();
        let mut count: u32 = 1;

        while clear.peek().is_some() && *clear.peek().unwrap() == ch {
            count += 1;
            clear.next();
        }

        match ch {
            '+' => code.push(
                Instruction::Add( (count % 256) as u8 )
            ),
            '-' => code.push(
                Instruction::Subtract( (count % 256) as u8 )
            ),
            '>' => code.push(
                Instruction::Move( count as isize )
            ),
            '<' => code.push(
                Instruction::Move( -(count as isize) )
            ),
            '[' => stack.push(
                code.len()
            ),
            ']' => code.push(
                Instruction::Loop(match stack.pop() {
                    Some(v) => v,
                    None => return Err("Mismatched parenthesis")
                })
            ),
            '.' => for _i in 0..count {
                code.push(
                    Instruction::Write
                )
            },
            ',' => for _i in 0..count {
                code.push(
                    Instruction::Read
                )
            },
            _ => {}
        }
    }

    if stack.len() > 0 {
        Err("Mismatched parenthesis")
    } else {
        Ok(code)
    }
}

pub struct Machine {
    memory: Vec<u8>
}

impl Machine {
    pub fn new(memory_size: usize) -> Machine {
        Machine {
            memory: vec![0u8; memory_size]
        }
    }
}

pub trait BrainfrickExecutor {
    fn execute(&mut self, code: &Vec<Instruction>);
}

impl BrainfrickExecutor for Machine {
    fn execute(&mut self, code: &Vec<Instruction>) {
        let mut instruction_pointer = 0;
        let mut      memory_pointer = 0;

        while instruction_pointer < code.len() {
            let instruction = &code[instruction_pointer];
            instruction_pointer += 1;

            match instruction {
                Instruction::Add(amount) => {
                    let cell = &mut self.memory[ memory_pointer ];

                    *cell = ( (*cell as u16 + *amount as u16) % 256 ) as u8;
                },
                Instruction::Subtract(amount) => {
                    let cell = &mut self.memory[ memory_pointer ];

                    *cell = ( (*cell as u16 + 256 - *amount as u16) % 256 ) as u8;
                },
                Instruction::Move(vector) => {
                    memory_pointer = (memory_pointer as isize + *vector) as usize % self.memory.len();
                },
                Instruction::Loop(position) => {
                    if self.memory[ memory_pointer ] != 0 {
                        instruction_pointer = *position;
                    }
                },
                Instruction::Write => {
                    print!("{}", self.memory[ memory_pointer ] as char);
                },
                Instruction::Read => {
                    let mut ch = [0u8; 1];
                    io::stdin().lock().read(&mut ch).unwrap();
                    self.memory[ memory_pointer ] = ch[0];
                },
            }
        }
    }
}

