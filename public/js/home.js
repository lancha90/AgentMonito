$(document).on('ready',function() {

    $('header nav ul li').removeClass('select');
    $('header nav ul li#menu_home').addClass('select');
    
    $.ajax({
            url : url_base+'api/v1/home',
            type : 'GET',
            dataType : "json",
            timeout : 10000,
            crossDomain : true,
            success : function(_data){
                
                $('.home_hostname').html(_data.hostname);

                $('#home_arch').html(_data.arch);
                $('#home_cpu_count').html(_data.cpu.length);

                var html_cpu='';
                for(key in _data.cpu){
                    html_cpu=html_cpu+'<div class="home_item_cpu"><h4> Modelo: '+_data.cpu[key].model+'</h4>';
                    html_cpu=html_cpu+'<h4> Speed: '+_data.cpu[key].speed+'</h4></div>';

                }
                $('#home_cpu').append(html_cpu);

                var html_net='';
                for(key in _data.network){
                    html_net=html_net+'<div class="home_item_net"><h3> Name: '+key+'</h3>';

                    for(item in _data.network[key]){
                        html_net=html_net+'<div class="home_item_net_child">'
                        html_net=html_net+'<h5>address: '+_data.network[key][item].address+'</h5>';
                        html_net=html_net+'<h5>family: '+_data.network[key][item].family+'</h5>';
                        html_net=html_net+'<h5>internal: '+_data.network[key][item].internal+'</h5>';
                        html_net=html_net+'</div>'
                    }

                    html_net=html_net+'</div></div>';
                    
                }
                $('#home_net').append(html_net);

            }
        });
});