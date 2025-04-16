$(document).ready(function() {
    // Sign-Up
    $('#signup-form').submit(function(e) {
        e.preventDefault();
        var data = {
            email: $('[name="email"]', this).val(),
            password: $('[name="password"]', this).val(),
            re_password: $('[name="re_password"]', this).val()
        };
        console.log('Sending sign-up data:', data);
        $.ajax({
            url: 'http://localhost:5000/api/users/signup',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Sign-up success:', response);
                $('#signup-message').text(response.message).css('color', 'green');
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    $('#myModal4').modal('hide');
                    setTimeout(function() { window.location.reload(); }, 1000);
                }
            },
            error: function(xhr) {
                console.log('Sign-up error:', xhr.responseJSON || xhr.statusText);
                var error = xhr.responseJSON ? xhr.responseJSON.message : 'Error occurred';
                $('#signup-message').text(error).css('color', 'red');
            }
        });
    });

    // Login
    $('#login-form').submit(function(e) {
        e.preventDefault();
        var data = {
            email: $('[name="email"]', this).val(),
            password: $('[name="password"]', this).val()
        };
        console.log('Sending login data:', data);
        $.ajax({
            url: 'http://localhost:5000/api/users/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Login success:', response);
                $('#login-message').text(response.message).css('color', 'green');
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    $('#myModal4').modal('hide');
                    setTimeout(function() { window.location.reload(); }, 1000);
                }
            },
            error: function(xhr) {
                console.log('Login error:', xhr.responseJSON || xhr.statusText);
                var error = xhr.responseJSON ? xhr.responseJSON.message : 'Error occurred';
                $('#login-message').text(error).css('color', 'red');
            }
        });
    });

    // Add Product
    $('#product-form').submit(function(e) {
        e.preventDefault();
        var data = {
            name: $('[name="name"]', this).val(),
            price: parseFloat($('[name="price"]', this).val()),
            image: $('[name="image"]', this).val(),
            category: $('[name="category"]', this).val()
        };
        console.log('Sending product data:', data);
        $.ajax({
            url: 'http://localhost:5000/api/products',
            type: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Product add success:', response);
                $('#product-message').text(response.message).css('color', 'green');
                $('[name="name"], [name="price"], [name="image"], [name="category"]').val('');
                loadProducts();
            },
            error: function(xhr) {
                console.log('Product add error:', xhr.responseJSON || xhr.statusText);
                var error = xhr.responseJSON ? xhr.responseJSON.message : 'Error occurred';
                $('#product-message').text(error).css('color', 'red');
            }
        });
    });

    // Load Products
    function loadProducts() {
        $.ajax({
            url: 'http://localhost:5000/api/products',
            type: 'GET',
            success: function(products) {
                console.log('Products fetched:', products);
                var html = '';
                products.forEach(function(p) {
                    html += `
                        <div class="col-md-3 product-men">
                            <div class="men-pro-item simpleCart_shelfItem">
                                <div class="men-thumb-item">
                                    <img src="${p.image}" alt="${p.name}" class="pro-image-front img-responsive">
                                    <img src="${p.image}" alt="${p.name}" class="pro-image-back img-responsive">
                                    <div class="men-cart-pro">
                                        <div class="inner-men-cart-pro">
                                            <a href="single.html" class="link-product-add-cart">Quick View</a>
                                        </div>
                                    </div>
                                    <span class="product-new-top">New</span>
                                </div>
                                <div class="item-info-product">
                                    <h4><a href="single.html">${p.name}</a></h4>
                                    <div class="info-product-price">
                                        <span class="item_price">$${p.price.toFixed(2)}</span>
                                        <del>$${ (p.price * 1.5).toFixed(2) }</del>
                                    </div>
                                    <a href="#" class="item_add single-item hvr-outline-out button2">Add to cart</a>
                                </div>
                            </div>
                        </div>`;
                });
                $('#product-list').html(html || '<p>No products available.</p>');
            },
            error: function(xhr) {
                console.log('Products fetch error:', xhr.responseJSON || xhr.statusText);
                $('#product-list').html('<p>Error loading products.</p>');
            }
        });
    }

    // Initialize product list if on product page
    if ($('#product-list').length) {
        loadProducts();
    }
});