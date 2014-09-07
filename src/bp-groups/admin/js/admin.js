/* global BP_Group_Admin, group_id, isRtl */

(function($) {

	function add_member_to_list( e, ui ) {
		$('#bp-groups-new-members-list').append('<li data-login="' + ui.item.value + '"><a href="#" class="bp-groups-remove-new-member">x</a> ' + ui.item.label + '</li>');
	}

	var id = 'undefined' !== typeof group_id ? '&group_id=' + group_id : '';
	$(document).ready( function() {
		window.warn_on_leave = false;

		/* Initialize autocomplete */
		$( '#bp-member-new-group-search' ).autocomplete( {
			source:    get_group_suggestions,
			delay:     500,
			minLength: 2,
			position:  ( 'undefined' !== typeof isRtl && isRtl ) ? { my: 'right top', at: 'right bottom', offset: '0, -1' } : { offset: '0, -1' },
			open:      function() { $(this).addClass('open'); },
			close:     function() { $(this).removeClass('open'); $(this).val(''); },
			select:    function( event, ui ) { add_group_to_list( event, ui ); }
		} );

		$( '.bp-groups-remove-group' ).on( 'click', function ( e ) {
			var group_id = $( e.target ).data( 'group-id' );
			$( '.bp-group-users-groups #bp-groups-role-' + group_id )
				.find( 'option' )
					.removeAttr( 'selected' )
				.end()
				.find( 'option.remove' ).attr( 'selected', 'selected' );
		} );

		$( '#bp-member-new-groups-list' ).on( 'click', '.bp-groups-remove-new-group', function ( e ) {
			var group_id = $( e.target ).data( 'group-id' );
			var group_idx = new_groups.indexOf(group_id);
			if ( group_idx >= 0 ) {
				new_groups.splice( group_idx, 1 );
			}
			$(e.target )
				.closest( 'tr' )
				.remove();
		} );


		/* Initialize autocomplete */
		$( '.bp-suggest-user' ).autocomplete({
			source:	ajaxurl + '?action=bp_group_admin_member_autocomplete' + id,
			delay:	 500,
			minLength: 2,
			position:  ( 'undefined' !== typeof isRtl && isRtl ) ? { my: 'right top', at: 'right bottom', offset: '0, -1' } : { offset: '0, -1' },
			open:	  function() { $(this).addClass('open'); },
			close:	 function() { $(this).removeClass('open'); $(this).val(''); },
			select:	function( event, ui ) { add_member_to_list( event, ui ); }
		});

		/* Replace noscript placeholder */
		$( '#bp-groups-new-members'      ).prop( 'placeholder', BP_Group_Admin.add_member_placeholder );
		$( '#bp-member-new-group-search' ).prop( 'placeholder', BP_Group_Admin.add_group_search_placeholder );

		/* Remove a member on 'x' click */
		$( '#bp_group_add_members' ).on( 'click', '.bp-groups-remove-new-member', function( e ) {
			e.preventDefault();
			$( e.target.parentNode ).remove();
		} );

		/* Warn before leaving unsaved changes */
		$(document).on( 'change', 'input#bp-groups-name, input#bp-groups-description, select.bp-groups-role, #bp-groups-settings-section-status input[type="radio"]', function() {
			window.warn_on_leave = true;
		});

		$( 'input#save' ).on( 'click', function() {
			/* Check for users to add */
			var users_to_add = [];

			$( '#bp-groups-new-members-list li' ).each( function() {
				users_to_add.push( $(this).data('login' ) );
			} );

			/* There are users to add, include a comma separated list of users login in the main field */
			if ( users_to_add.length ) {
				$( '#bp-groups-new-members' ).val( '' ).val( users_to_add.join( ', ' ) );
			}

			window.warn_on_leave = false;
		});

		window.onbeforeunload = function() {
			if ( window.warn_on_leave ) {
				return BP_Group_Admin.warn_on_leave;
			}
		};
	});

	var new_groups = [];

	function add_group_to_list( e, ui ) {
		var group = ui.item,
			groupRow = $( '#bp-member-new-group-template' ).clone();

		new_groups.push( group.id );
		groupRow
			.attr( 'id', '')
			.show()
			.find( '.gid-column' )
				.text( group.id )
			.end()
			.find( '.gname-column > a' )
				.attr( 'href', group.edit_url )
				.html( group.avatar )
			.end()
			.find( '.bp-groups-new-role' )
				.attr( 'name', 'bp-groups-added-role[' + group.id + ']' )
			.end()
			.find( '.gname-column > span a' )
				.attr( 'href', group.edit_url )
				.text( group.name )
			.end()
			.find( '.bp-groups-remove-new-group' )
				.data( 'groupId', group.id );
		$( '#bp-member-new-groups-list' ).append( groupRow );
	}

	function get_group_suggestions( req, resp ) {
		var url = ajaxurl + '?action=bp_group_admin_autocomplete_group&user_id=' + encodeURIComponent( user_id )
			+ '&term=' + encodeURIComponent( req.term );
		$.ajax( {
			url: url,
			type: 'GET',
			dataType: 'json',
			success: function ( data ) {
				var groups = data.filter( function ( g ) { return new_groups.indexOf( g.id ) < 0; } );
				resp( groups );
			},
			error: function () {
				resp();
			}
		} );
	}
})( jQuery );
