use std::env;
use std::fs;

mod brainfrick;
use brainfrick::BrainfrickExecutor;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Usage: $ brainfrick path/to/file.b [<memory size in bytes>]");
        return;
    }

    let filename = &args[1];

    let contents = match fs::read_to_string(filename) {
        Ok(data) => data,
        Err(e) => {
            println!("Error reading file `{}`: {}", filename, e);
            return;
        }
    };

    let code = match brainfrick::parse(&contents) {
        Ok(data) => data,
        Err(e) => {
            println!("Error parsing code: {}", e);
            return;
        }
    };

    let memory_size = if args.len() < 3 {
        32_000
    } else {
        match args[2].parse() {
            Ok(n) => n,
            Err(e) => {
                println!("Invalid memory size in bytes `{}`: {}", args[2], e);
                return;
            }
        }
    };
    let mut machine = brainfrick::Machine::new(memory_size);

    machine.execute(&code);
}
