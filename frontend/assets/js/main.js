// Load Navbar
fetch("components/navbar.html")
  .then(res => res.text())
  .then(data => document.getElementById("navbar").innerHTML = data);

// Load Footer
fetch("components/footer.html")
  .then(res => res.text())
  .then(data => document.getElementById("footer").innerHTML = data);
