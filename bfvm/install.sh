cargo build --release
sudo rm /usr/local/bin/brainfrick
sudo cp ./target/release/bfvm /usr/local/bin/brainfrick