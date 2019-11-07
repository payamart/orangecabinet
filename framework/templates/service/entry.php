<?php 
global $kitgreen_loop;
?>
<div class="service_inner" >
    <div class="service-image" onclick="window.location.href='<?php the_permalink(); ?>'">
            <?php echo kitgreen_get_post_thumbnail( 'large'); ?> 
            <div class="redmore ">
                <a class="lnr lnr-link" href="<?php the_permalink(); ?>"></a>
            </div>
    </div>
    <div class="service-content">
        <div class="title">
            <h6><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h6>
        </div>
        <div class="excerpt">
            <?php the_excerpt(); ?>
        </div>
    </div>

</div>